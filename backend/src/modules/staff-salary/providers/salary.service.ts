import { ConflictException, HttpStatus, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { Salary } from "../entities/salary.entity";
import { CreateSalaryDto } from "../dto/create-salary.dto";
import { UpdateSalaryDto } from "../dto/update-salary.dto";
import { ExpensesService } from "../../expenses/providers/expenses.service";
import { ExpenseCategoriesService } from "../../expense-categories/providers/expense-categories.service";
import { ExpenseStatus } from "../../expenses/enum/expense-status.enum";
import { CacheService } from "../../cache/cache.service";

@Injectable()
export class SalaryService {
    private salaryExpenseCategoryId: string | null = null;

    constructor(
        @InjectRepository(Salary)
        private readonly salaryRepository: Repository<Salary>,
        private readonly expensesService: ExpensesService,
        private readonly expenseCategoriesService: ExpenseCategoriesService,
        private readonly cacheService: CacheService,
    ) {}

    private async getSalaryExpenseCategory(): Promise<string> {
        if (this.salaryExpenseCategoryId) {
            return this.salaryExpenseCategoryId;
        }

        try {
            const category = await this.expenseCategoriesService.findBySlug('staff-salary');
            this.salaryExpenseCategoryId = category?.id ?? null;
            if (!this.salaryExpenseCategoryId) {
                throw new Error('Failed to get salary expense category ID');
            }
            return this.salaryExpenseCategoryId;
        } catch (error) {
            const newCategory = await this.expenseCategoriesService.create({
                name: 'Staff Salary',
                slug: 'staff-salary',
                description: 'Expenses related to staff salary payments',
                icon: 'wallet-outline'
            });
            this.salaryExpenseCategoryId = newCategory.id ?? null;
            if (!this.salaryExpenseCategoryId) {
                throw new Error('Failed to get salary expense category ID');
            }
            return this.salaryExpenseCategoryId;
        }
    }

    private async createOrUpdateSalaryExpense(salary: Salary, isUpdate: boolean = false): Promise<void> {
        const categoryId = await this.getSalaryExpenseCategory();
        const expenseTitle = `Salary - ${salary.user.first_name} ${salary.user.last_name} (${salary.month.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })})`;
        const expenseDescription = `Salary payment for ${salary.user.first_name} ${salary.user.last_name}\nBase Salary: $${salary.base_salary}${salary.bonus ? `\nBonus: $${salary.bonus}` : ''}${salary.deductions ? `\nDeductions: $${salary.deductions}` : ''}\nTotal Payable: $${salary.total_payble}${salary.notes ? `\nNotes: ${salary.notes}` : ''}`;
        
        if (isUpdate) {
            try {
                const expenses = await this.expensesService.findByCategory(categoryId);
                const existingExpense = expenses.find(expense => 
                    expense.title.includes(`${salary.user.first_name} ${salary.user.last_name}`) &&
                    expense.title.includes(salary.month.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }))
                );
                
                if (existingExpense) {
                    await this.expensesService.update(existingExpense.id!, {
                        title: expenseTitle,
                        amount: salary.total_payble,
                        description: expenseDescription,
                        status: salary.is_paid ? ExpenseStatus.APPROVED : ExpenseStatus.PENDING,
                        category_id: categoryId
                    });
                    return;
                }
            } catch (error) {
                console.warn('Failed to update existing salary expense, creating new one:', error);
            }
        }

        await this.expensesService.create({
            title: expenseTitle,
            amount: salary.total_payble,
            description: expenseDescription,
            status: salary.is_paid ? ExpenseStatus.APPROVED : ExpenseStatus.PENDING,
            category_id: categoryId
        });
    }

    private async findSalaryOrFail(criteria: FindOptionsWhere<Salary>): Promise<Salary> {
        const salary = await this.salaryRepository.findOne({
            where: criteria,
            relations: ['user'],
        });
        if (!salary) {
            throw new NotFoundException(`Salary not found`);
        }
        return salary;
    }

    private async invalidateSalaryCaches(): Promise<void> {
        const patterns = [
            'salary:*',
            'salaries:*',
            'user-salary:*'
        ];
        
        for (const pattern of patterns) {
            const keys = await this.cacheService.getKeys(pattern);
            if (keys.length > 0) {
                await this.cacheService.deleteMany(keys);
            }
        }
    }

    async create(createSalaryDto: CreateSalaryDto): Promise<Salary> {
        const errors: string[] = [];

        const existingSalary = await this.salaryRepository.findOne({
            where: {
                user: { id: createSalaryDto.user_id },
                month: createSalaryDto.month
            },
            relations: ['user'],
        });

        if (existingSalary) {
            errors.push('Salary record already exists for this month');
        }

        if (errors.length > 0) {
            throw new ConflictException({
                status: 'error',
                messages: errors,
                message: errors.join('. '),
                statusCode: HttpStatus.CONFLICT
            });
        }

        const salary = this.salaryRepository.create({
            ...createSalaryDto,
            is_paid: createSalaryDto.is_paid || false,
            user: { id: createSalaryDto.user_id },
        });
        const saved: Salary = await this.salaryRepository.save(salary);
        const result = await this.findOne(saved.id);
        await this.createOrUpdateSalaryExpense(result);
        await this.invalidateSalaryCaches();
        return result;
    }

    async findAll(options?: {
        user_id?: string,
        isPaid?: boolean,
        startDate?: Date,
        endDate?: Date,
        page?: number,
        limit?: number
    }): Promise<{ data: Salary[], total: number, totalPages: number }> {
        const cacheKey = `salaries:findAll:${JSON.stringify(options || {})}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached as { data: Salary[], total: number, totalPages: number };
        }

        const query = this.salaryRepository.createQueryBuilder('salary')
            .leftJoin('salary.user', 'user')
            .addSelect([
                'user.first_name',
                'user.last_name',
                'user.id',
                'user.role',
                'user.picture',
                'user.status'
            ]);

        if (options?.user_id) {
            query.andWhere('user.id = :userId', { userId: options.user_id });
        }

        if (options?.isPaid !== undefined) {
            query.andWhere('salary.is_paid = :isPaid', { isPaid: options.isPaid });
        }

        if (options?.startDate && options?.endDate) {
            query.andWhere('salary.month BETWEEN :startDate AND :endDate', {
                startDate: options.startDate,
                endDate: options.endDate
            });
        } else if (options?.startDate) {
            query.andWhere('salary.month >= :startDate', { startDate: options.startDate });
        } else if (options?.endDate) {
            query.andWhere('salary.month <= :endDate', { endDate: options.endDate });
        }

        const page = options?.page || 1;
        const limit = options?.limit || 10;
        query.skip((page - 1) * limit).take(limit);

        query.orderBy('salary.month', 'DESC');

        const [data, total] = await query.getManyAndCount();
        const totalPages = Math.ceil(total / limit);

        const result = { data, total, totalPages };
        await this.cacheService.set(cacheKey, result, 3600);
        return result;
    }

    async findOne(id: string): Promise<Salary> {
        const cacheKey = `salary:findOne:${id}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached as Salary;
        }

        const salary = await this.salaryRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!salary) {
            throw new NotFoundException(`Salary not found`);
        }
        
        await this.cacheService.set(cacheKey, salary, 3600);
        return salary;
    }

    async update(id: string, updateSalaryDto: UpdateSalaryDto): Promise<Salary> {
        await this.findSalaryOrFail({ id });
        await this.salaryRepository.update(id, updateSalaryDto);
        const result = await this.findOne(id);
        await this.createOrUpdateSalaryExpense(result, true);
        await this.invalidateSalaryCaches();
        return result;
    }

    async markAsPaid(id: string, paymentData: {
        receipt_image?: string
    }): Promise<Salary> {
        const salary = await this.findSalaryOrFail({ id });

        if (salary.is_paid) {
            throw new BadRequestException('Salary has already been marked as paid');
        }

        await this.salaryRepository.update(id, {
            is_paid: true,
            receipt_image: paymentData.receipt_image
        });

        const result = await this.findOne(id);
        await this.createOrUpdateSalaryExpense(result, true);
        await this.invalidateSalaryCaches();
        return result;
    }

    async markAsUnpaid(id: string): Promise<Salary> {
        const salary = await this.findSalaryOrFail({ id });

        if (!salary.is_paid) {
            throw new BadRequestException('Salary is already marked as unpaid');
        }

        await this.salaryRepository.update(id, {
            is_paid: false
        });

        const result = await this.findOne(id);
        await this.createOrUpdateSalaryExpense(result, true);
        await this.invalidateSalaryCaches();
        return result;
    }

    async getUserSalaryHistory(userId: string, year?: number): Promise<Salary[]> {
        const cacheKey = `user-salary:history:${userId}:${year || 'all'}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached as Salary[];
        }

        const query = this.salaryRepository.createQueryBuilder('salary')
            .leftJoin('salary.user', 'user')
            .addSelect([
                'user.first_name',
                'user.last_name',
                'user.id',
                'user.role',
                'user.picture',
                'user.status'
            ])
            .where('user.id = :userId', { userId });

        if (year) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            query.andWhere('salary.month BETWEEN :startDate AND :endDate', {
                startDate,
                endDate
            });
        }

        query.orderBy('salary.month', 'DESC');
        const result = await query.getMany();
        
        await this.cacheService.set(cacheKey, result, 3600);
        return result;
    }

    async remove(id: string): Promise<void> {
        const result = await this.salaryRepository.softDelete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Salary not found`);
        }
        await this.invalidateSalaryCaches();
    }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.salaryRepository.softDelete(ids);
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.salaryRepository.createQueryBuilder('salary')
            .withDeleted()
            .where('salary.deleted_at IS NOT NULL');

        query.orderBy('salary.deleted_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.salaryRepository.restore(id);
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.salaryRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.salaryRepository.delete(id);
    }
}
