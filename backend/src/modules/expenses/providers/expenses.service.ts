import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expenses } from '../entities/expenses.entity';
import { CreateExpensesDto } from '../dto/create-expenses.dto';
import { UpdateExpensesDto } from '../dto/update-expenses.dto';
import { ExpensesResponseDto } from '../dto/expenses-response.dto';
import { ExpenseCategory } from '../../expense-categories/entities/expense-categories.entity';
import { ExpenseStatus } from '../enum/expense-status.enum';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expenses)
        private readonly expensesRepository: Repository<Expenses>,
        @InjectRepository(ExpenseCategory)
        private readonly expenseCategoryRepository: Repository<ExpenseCategory>,
        private readonly cacheService: CacheService,
    ) {}

    private async invalidateCache(): Promise<void> {
        const patterns = [
            'expenses:*',
            'expense:*'
        ];

        for (const pattern of patterns) {
            const keys = await this.cacheService.getKeys(pattern);
            if (keys.length > 0) {
                await this.cacheService.deleteMany(keys);
            }
        }
    }

    async create(createExpensesDto: CreateExpensesDto): Promise<ExpensesResponseDto> {
        const category = await this.expenseCategoryRepository.findOne({
            where: { id: createExpensesDto.category_id },
        });
        if (!category) {
            throw new NotFoundException(`Expense category with ID ${createExpensesDto.category_id} not found`);
        }
        
        const expense = this.expensesRepository.create({
            title: createExpensesDto.title,
            amount: createExpensesDto.amount,
            description: createExpensesDto.description,
            status: createExpensesDto.status || ExpenseStatus.PENDING,
            category,
        });
        
        const savedExpense = await this.expensesRepository.save(expense);
        
        await this.invalidateCache();
        
        return new ExpensesResponseDto(savedExpense);
    }

    async findAll(options?: {
        categoryId?: string;
        status?: ExpenseStatus;
        dateFilter?: 'today' | 'week' | 'month' | 'all';
        page?: number;
        limit?: number;
    }): Promise<{
        data: ExpensesResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const categoryId = options?.categoryId || '';
        const status = options?.status || '';
        const dateFilter = options?.dateFilter || 'all';
        
        const cacheKey = `expenses:page:${page}:limit:${limit}:category:${categoryId}:status:${status}:date:${dateFilter}`;
        
        const cachedResult = await this.cacheService.get(cacheKey);
        if (cachedResult) {
            return {
                data: (cachedResult as any).data,
                total: (cachedResult as any).total,
                page: (cachedResult as any).page,
                limit: (cachedResult as any).limit,
                totalPages: (cachedResult as any).totalPages
            };
        }
        
        const queryBuilder = this.expensesRepository.createQueryBuilder('expense')
            .leftJoinAndSelect('expense.category', 'category');
        
        if (options?.categoryId) {
            queryBuilder.andWhere('category.id = :categoryId', { categoryId: options.categoryId });
        }
        
        if (options?.status) {
            queryBuilder.andWhere('expense.status = :status', { status: options.status });
        }
        
        if (options?.dateFilter && options.dateFilter !== 'all') {
            const now = new Date();
            let startDate: Date;
            
            switch (options.dateFilter) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    queryBuilder.andWhere('expense.created_at >= :startDate', { startDate });
                    break;
                    
                case 'week':
                    const dayOfWeek = now.getDay();
                    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract);
                    queryBuilder.andWhere('expense.created_at >= :startDate', { startDate });
                    break;
                    
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    queryBuilder.andWhere('expense.created_at >= :startDate', { startDate });
                    break;
                    
                default:
                    break;
            }
        }
        
        queryBuilder
            .orderBy('expense.created_at', 'DESC')
            .addOrderBy('expense.id', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);
        
        const [expenses, total] = await queryBuilder.getManyAndCount();
        const totalPages = Math.ceil(total / limit);
        
        const result = {
            data: expenses.map(expense => new ExpensesResponseDto(expense)),
            total,
            page,
            limit,
            totalPages
        };
        
        await this.cacheService.set(cacheKey, result, 3600);
        
        return result;
    }

    async findOne(id: string): Promise<ExpensesResponseDto> {
        const cacheKey = `expense:${id}`;
        
        const cachedExpense = await this.cacheService.get(cacheKey);
        if (cachedExpense) {
            return new ExpensesResponseDto(cachedExpense as Expenses);
        }

        const expense = await this.expensesRepository.findOne({
            where: { id },
            relations: ['category'],
        });

        if (!expense) {
            throw new NotFoundException(`Expense with ID ${id} not found`);
        }

        const result = new ExpensesResponseDto(expense);
        await this.cacheService.set(cacheKey, result, 3600);
        
        return result;
    }

    async findByCategory(categoryId: string): Promise<ExpensesResponseDto[]> {
        const cacheKey = `expenses:category:${categoryId}`;
        
        const cachedExpenses = await this.cacheService.get(cacheKey);
        if (cachedExpenses) {
            return cachedExpenses as ExpensesResponseDto[];
        }

        const category = await this.expenseCategoryRepository.findOne({
            where: { id: categoryId },
        });
        
        if (!category) {
            throw new NotFoundException(`Expense category with ID ${categoryId} not found`);
        }
        
        const expenses = await this.expensesRepository.find({
            where: { category: { id: categoryId } },
            relations: ['category'],
        });

        const result = expenses.map(expense => new ExpensesResponseDto(expense));
        await this.cacheService.set(cacheKey, result, 3600);
        
        return result;
    }

    async findByStatus(status: ExpenseStatus): Promise<ExpensesResponseDto[]> {
        const cacheKey = `expenses:status:${status}`;
        
        const cachedExpenses = await this.cacheService.get(cacheKey);
        if (cachedExpenses) {
            return cachedExpenses as ExpensesResponseDto[];
        }

        if (!Object.values(ExpenseStatus).includes(status)) {
            throw new BadRequestException(`Invalid expense status: ${status}`);
        }
        
        const expenses = await this.expensesRepository.find({
            where: { status },
            relations: ['category'],
        });

        const result = expenses.map(expense => new ExpensesResponseDto(expense));
        await this.cacheService.set(cacheKey, result, 3600);
        
        return result;
    }

    async update(id: string, updateExpensesDto: UpdateExpensesDto): Promise<ExpensesResponseDto> {
        const expense = await this.expensesRepository.findOne({
            where: { id },
            relations: ['category'],
        });

        if (!expense) {
            throw new NotFoundException(`Expense with ID ${id} not found`);
        }

        if (updateExpensesDto.category_id) {
            const category = await this.expenseCategoryRepository.findOne({
                where: { id: updateExpensesDto.category_id },
            });
            if (!category) {
                throw new NotFoundException(`Expense category with ID ${updateExpensesDto.category_id} not found`);
            }
            expense.category = category;
        }

        if (updateExpensesDto.title !== undefined) {
            expense.title = updateExpensesDto.title;
        }
        if (updateExpensesDto.amount !== undefined) {
            expense.amount = updateExpensesDto.amount;
        }
        if (updateExpensesDto.description !== undefined) {
            expense.description = updateExpensesDto.description;
        }
        if (updateExpensesDto.status !== undefined) {
            expense.status = updateExpensesDto.status;
        }

        const updatedExpense = await this.expensesRepository.save(expense);
        
        await this.invalidateCache();
        
        return new ExpensesResponseDto(updatedExpense);
    }

    async updateStatus(id: string, status: ExpenseStatus): Promise<ExpensesResponseDto> {
        if (!Object.values(ExpenseStatus).includes(status)) {
            throw new BadRequestException(`Invalid expense status: ${status}`);
        }

        const expense = await this.expensesRepository.findOne({
            where: { id },
            relations: ['category'],
        });

        if (!expense) {
            throw new NotFoundException(`Expense with ID ${id} not found`);
        }

        expense.status = status;
        const updatedExpense = await this.expensesRepository.save(expense);

        await this.invalidateCache();

        return new ExpensesResponseDto(updatedExpense);
    }

    async updateMultipleStatus(ids: string[], status: ExpenseStatus): Promise<ExpensesResponseDto[]> {
        if (!Object.values(ExpenseStatus).includes(status)) {
            throw new BadRequestException(`Invalid expense status: ${status}`);
        }

        const expenses = await this.expensesRepository.find({
            where: { id: { $in: ids } as any },
            relations: ['category'],
        });

        if (expenses.length !== ids.length) {
            throw new NotFoundException('One or more expenses not found');
        }

        expenses.forEach(expense => {
            expense.status = status;
        });

        const updatedExpenses = await this.expensesRepository.save(expenses);
        
        await this.invalidateCache();
        
        return updatedExpenses.map(expense => new ExpensesResponseDto(expense));
    }

    async remove(id: string): Promise<void> {
        const result = await this.expensesRepository.softDelete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Expense with ID ${id} not found`);
        }
        
        await this.invalidateCache();
    }

    async getSummary(): Promise<{
        totalExpenses: number;
        categoryBreakdown: { category: string; amount: number }[];
        statusBreakdown: { status: string; amount: number; count: number }[];
    }> {
        const cacheKey = 'expenses:summary';
        const cachedSummary = await this.cacheService.get(cacheKey);
        if (cachedSummary) {
            return {
                totalExpenses: (cachedSummary as any).totalExpenses,
                categoryBreakdown: (cachedSummary as any).categoryBreakdown,
                statusBreakdown: (cachedSummary as any).statusBreakdown
            };
        }

        const expenses = await this.expensesRepository.find({
            relations: ['category'],
        });
        
        const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        
        const categoryMap = new Map<string, number>();
        expenses.forEach(expense => {
            const categoryName = expense.category.name;
            const currentAmount = categoryMap.get(categoryName) || 0;
            categoryMap.set(categoryName, currentAmount + Number(expense.amount));
        });
        
        const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, amount]) => ({
            category,
            amount
        }));
        
        const statusMap = new Map<string, { amount: number; count: number }>();
        expenses.forEach(expense => {
            const current = statusMap.get(expense.status) || { amount: 0, count: 0 };
            statusMap.set(expense.status, {
                amount: current.amount + Number(expense.amount),
                count: current.count + 1
            });
        });
        
        const statusBreakdown = Array.from(statusMap.entries()).map(([status, data]) => ({
            status,
            amount: data.amount,
            count: data.count
        }));
        
        const result = {
            totalExpenses,
            categoryBreakdown,
            statusBreakdown
        };
        
        await this.cacheService.set(cacheKey, result, 1800);
        return result;
    }

    async getExpensesByStatus(
        status: ExpenseStatus,
        page: number = 1,
        limit: number = 10
    ): Promise<{
        data: ExpensesResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return this.findAll({ status, page, limit });
    }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.expensesRepository.softDelete(ids);
        await this.invalidateCache();
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.expensesRepository.createQueryBuilder('expense')
            .withDeleted()
            .where('expense.deleted_at IS NOT NULL');

        if (search) {
            query.andWhere('LOWER(expense.title) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.orderBy('expense.deleted_at', 'DESC')
            .addOrderBy('expense.id', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.expensesRepository.restore(id);
        await this.invalidateCache();
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.expensesRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.expensesRepository.delete(id);
        await this.invalidateCache();
    }
}
