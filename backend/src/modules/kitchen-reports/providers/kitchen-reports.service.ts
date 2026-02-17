import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import moment from 'moment-timezone';
import { OrderToken } from '../../order-tokens/entities/order-token.entity';
import { TokenType } from '../../order-tokens/enum/TokenType.enum';
import { OrderTokenStatus } from '../../order-tokens/enum/OrderTokenStatus.enum';
import { OrderTokenPriority } from '../../order-tokens/enum/OrderTokenPriority.enum';
import { CacheService } from '../../cache/cache.service';
import { KitchenSummaryDto, StatusBreakdownDto } from '../dto/kitchen-summary.dto';
import { KitchenEfficiencyDto, TimeDistributionDto, PriorityBreakdownItemDto } from '../dto/kitchen-efficiency.dto';
import { KitchenItemPerformanceDto, TopItemDto } from '../dto/kitchen-item-performance.dto';
import { KitchenPeakHoursDto, PeakHourItemDto } from '../dto/kitchen-peak-hours.dto';
import { KitchenComparisonDto, SectionMetricsDto } from '../dto/kitchen-comparison.dto';

const CACHE_TTL = 1800; // 30 minutes

@Injectable()
export class KitchenReportsService {
    private readonly logger = new Logger(KitchenReportsService.name);

    constructor(
        @InjectRepository(OrderToken)
        private readonly orderTokenRepository: Repository<OrderToken>,
        private readonly cacheService: CacheService,
    ) {}

    // ──────────────────────────────────────────────
    // Date range helper
    // ──────────────────────────────────────────────

    private getDateRange(
        date?: string,
        startDate?: string,
        endDate?: string,
        filterType?: string,
        filterValue?: string,
    ): { start: Date; end: Date } {
        if (date) {
            return {
                start: moment.tz(date, 'YYYY-MM-DD', true, 'Asia/Dhaka').startOf('day').toDate(),
                end: moment.tz(date, 'YYYY-MM-DD', true, 'Asia/Dhaka').endOf('day').toDate(),
            };
        }

        if (startDate && endDate) {
            return {
                start: moment.tz(startDate, 'YYYY-MM-DD', true, 'Asia/Dhaka').startOf('day').toDate(),
                end: moment.tz(endDate, 'YYYY-MM-DD', true, 'Asia/Dhaka').endOf('day').toDate(),
            };
        }

        if (filterType === 'month' && filterValue) {
            return {
                start: moment.tz(filterValue, 'YYYY-MM', true, 'Asia/Dhaka').startOf('month').toDate(),
                end: moment.tz(filterValue, 'YYYY-MM', true, 'Asia/Dhaka').endOf('month').toDate(),
            };
        }

        if (filterType === 'year' && filterValue) {
            return {
                start: moment.tz(filterValue, 'YYYY', true, 'Asia/Dhaka').startOf('year').toDate(),
                end: moment.tz(filterValue, 'YYYY', true, 'Asia/Dhaka').endOf('year').toDate(),
            };
        }

        // Default: today
        return {
            start: moment().tz('Asia/Dhaka').startOf('day').toDate(),
            end: moment().tz('Asia/Dhaka').endOf('day').toDate(),
        };
    }

    private buildCacheKey(prefix: string, date?: string, startDate?: string, endDate?: string, filterType?: string, filterValue?: string, extra?: string): string {
        const parts = [prefix, date || '', startDate || '', endDate || '', filterType || '', filterValue || ''];
        if (extra) parts.push(extra);
        return `kitchen-reports:${parts.join(':')}`;
    }

    private validateDateParam(date: string, paramName: string): void {
        if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
            throw new BadRequestException(`Invalid ${paramName} format. Expected YYYY-MM-DD, received: ${date}`);
        }
    }

    // ──────────────────────────────────────────────
    // Fetch kitchen tokens
    // ──────────────────────────────────────────────

    private async getKitchenTokens(start: Date, end: Date): Promise<OrderToken[]> {
        return this.orderTokenRepository.find({
            where: {
                token_type: TokenType.KITCHEN,
                createdAt: Between(start, end),
            },
            relations: ['order', 'order_items', 'order_items.item'],
        });
    }

    private async getAllTokens(start: Date, end: Date): Promise<OrderToken[]> {
        return this.orderTokenRepository.find({
            where: {
                createdAt: Between(start, end),
            },
            relations: ['order', 'order_items', 'order_items.item'],
        });
    }

    // ──────────────────────────────────────────────
    // Preparation time helpers
    // ──────────────────────────────────────────────

    private calculatePrepTimeMinutes(token: OrderToken): number | null {
        if (!token.readyAt || !token.createdAt) return null;
        const diffMs = new Date(token.readyAt).getTime() - new Date(token.createdAt).getTime();
        return diffMs / (1000 * 60);
    }

    private getTokenSales(token: OrderToken): number {
        return token.order_items.reduce((sum, item) => sum + Number(item.total_price), 0);
    }

    // ──────────────────────────────────────────────
    // 1. Summary
    // ──────────────────────────────────────────────

    async getSummary(
        date?: string,
        startDate?: string,
        endDate?: string,
        filterType?: string,
        filterValue?: string,
    ): Promise<KitchenSummaryDto> {
        if (date) this.validateDateParam(date, 'date');
        if (startDate) this.validateDateParam(startDate, 'startDate');
        if (endDate) this.validateDateParam(endDate, 'endDate');

        const cacheKey = this.buildCacheKey('summary', date, startDate, endDate, filterType, filterValue);
        const cached = await this.cacheService.get<KitchenSummaryDto>(cacheKey);
        if (cached) return cached;

        const { start, end } = this.getDateRange(date, startDate, endDate, filterType, filterValue);
        const tokens = await this.getKitchenTokens(start, end);

        const totalKitchenSales = tokens.reduce((sum, token) => sum + this.getTokenSales(token), 0);

        const statusBreakdown: StatusBreakdownDto = {
            pending: tokens.filter(t => t.status === OrderTokenStatus.PENDING).length,
            preparing: tokens.filter(t => t.status === OrderTokenStatus.PREPARING).length,
            ready: tokens.filter(t => t.status === OrderTokenStatus.READY).length,
            delivered: tokens.filter(t => t.status === OrderTokenStatus.DELIVERED).length,
            cancelled: tokens.filter(t => t.status === OrderTokenStatus.CANCELLED).length,
        };

        const prepTimes = tokens
            .map(t => this.calculatePrepTimeMinutes(t))
            .filter((t): t is number => t !== null && t >= 0);
        const averagePreparationTime = prepTimes.length > 0
            ? Math.round((prepTimes.reduce((sum, t) => sum + t, 0) / prepTimes.length) * 100) / 100
            : 0;

        const result: KitchenSummaryDto = {
            totalKitchenSales: Math.round(totalKitchenSales * 100) / 100,
            kitchenOrderCount: tokens.length,
            statusBreakdown,
            averagePreparationTime,
        };

        await this.cacheService.set(cacheKey, result, CACHE_TTL);
        return result;
    }

    // ──────────────────────────────────────────────
    // 2. Summary by date (path param)
    // ──────────────────────────────────────────────

    async getSummaryByDate(date: string): Promise<KitchenSummaryDto> {
        this.validateDateParam(date, 'date');
        return this.getSummary(date);
    }

    // ──────────────────────────────────────────────
    // 3. Efficiency
    // ──────────────────────────────────────────────

    async getEfficiency(
        date?: string,
        startDate?: string,
        endDate?: string,
        filterType?: string,
        filterValue?: string,
    ): Promise<KitchenEfficiencyDto> {
        if (date) this.validateDateParam(date, 'date');
        if (startDate) this.validateDateParam(startDate, 'startDate');
        if (endDate) this.validateDateParam(endDate, 'endDate');

        const cacheKey = this.buildCacheKey('efficiency', date, startDate, endDate, filterType, filterValue);
        const cached = await this.cacheService.get<KitchenEfficiencyDto>(cacheKey);
        if (cached) return cached;

        const { start, end } = this.getDateRange(date, startDate, endDate, filterType, filterValue);
        const tokens = await this.getKitchenTokens(start, end);

        const prepTimes = tokens
            .map(t => this.calculatePrepTimeMinutes(t))
            .filter((t): t is number => t !== null && t >= 0);

        const avgPreparationTime = prepTimes.length > 0
            ? Math.round((prepTimes.reduce((s, t) => s + t, 0) / prepTimes.length) * 100) / 100
            : 0;
        const minPreparationTime = prepTimes.length > 0
            ? Math.round(Math.min(...prepTimes) * 100) / 100
            : 0;
        const maxPreparationTime = prepTimes.length > 0
            ? Math.round(Math.max(...prepTimes) * 100) / 100
            : 0;

        const timeDistribution: TimeDistributionDto = {
            under5Min: prepTimes.filter(t => t < 5).length,
            fiveTo15Min: prepTimes.filter(t => t >= 5 && t < 15).length,
            fifteenTo30Min: prepTimes.filter(t => t >= 15 && t < 30).length,
            over30Min: prepTimes.filter(t => t >= 30).length,
        };

        const priorities = [OrderTokenPriority.NORMAL, OrderTokenPriority.HIGH, OrderTokenPriority.URGENT];
        const priorityBreakdown: PriorityBreakdownItemDto[] = priorities.map(priority => {
            const priorityTokens = tokens.filter(t => t.priority === priority);
            const priorityPrepTimes = priorityTokens
                .map(t => this.calculatePrepTimeMinutes(t))
                .filter((t): t is number => t !== null && t >= 0);

            const avgTime = priorityPrepTimes.length > 0
                ? Math.round((priorityPrepTimes.reduce((s, t) => s + t, 0) / priorityPrepTimes.length) * 100) / 100
                : 0;

            const completedCount = priorityTokens.filter(
                t => t.status === OrderTokenStatus.READY || t.status === OrderTokenStatus.DELIVERED,
            ).length;
            const completionRate = priorityTokens.length > 0
                ? Math.round((completedCount / priorityTokens.length) * 10000) / 100
                : 0;

            return {
                priority,
                count: priorityTokens.length,
                avgTime,
                completionRate,
            };
        });

        const result: KitchenEfficiencyDto = {
            avgPreparationTime,
            minPreparationTime,
            maxPreparationTime,
            timeDistribution,
            priorityBreakdown,
        };

        await this.cacheService.set(cacheKey, result, CACHE_TTL);
        return result;
    }

    // ──────────────────────────────────────────────
    // 4. Item Performance
    // ──────────────────────────────────────────────

    async getItemPerformance(
        date?: string,
        startDate?: string,
        endDate?: string,
        filterType?: string,
        filterValue?: string,
        limit: number = 10,
    ): Promise<KitchenItemPerformanceDto> {
        if (date) this.validateDateParam(date, 'date');
        if (startDate) this.validateDateParam(startDate, 'startDate');
        if (endDate) this.validateDateParam(endDate, 'endDate');

        const cacheKey = this.buildCacheKey('item-performance', date, startDate, endDate, filterType, filterValue, String(limit));
        const cached = await this.cacheService.get<KitchenItemPerformanceDto>(cacheKey);
        if (cached) return cached;

        const { start, end } = this.getDateRange(date, startDate, endDate, filterType, filterValue);
        const tokens = await this.getKitchenTokens(start, end);

        // Aggregate items across all kitchen tokens
        const itemMap = new Map<string, { itemId: string; itemName: string; quantitySold: number; revenue: number }>();

        for (const token of tokens) {
            for (const orderItem of token.order_items) {
                if (!orderItem.item) continue;
                const itemId = orderItem.item.id;
                const existing = itemMap.get(itemId);
                if (existing) {
                    existing.quantitySold += Number(orderItem.quantity);
                    existing.revenue += Number(orderItem.total_price);
                } else {
                    itemMap.set(itemId, {
                        itemId,
                        itemName: orderItem.item.name,
                        quantitySold: Number(orderItem.quantity),
                        revenue: Number(orderItem.total_price),
                    });
                }
            }
        }

        const totalRevenue = Array.from(itemMap.values()).reduce((sum, item) => sum + item.revenue, 0);

        const topItems: TopItemDto[] = Array.from(itemMap.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit)
            .map(item => ({
                itemId: item.itemId,
                itemName: item.itemName,
                quantitySold: item.quantitySold,
                revenue: Math.round(item.revenue * 100) / 100,
                percentageOfTotal: totalRevenue > 0
                    ? Math.round((item.revenue / totalRevenue) * 10000) / 100
                    : 0,
            }));

        const result: KitchenItemPerformanceDto = { topItems };

        await this.cacheService.set(cacheKey, result, CACHE_TTL);
        return result;
    }

    // ──────────────────────────────────────────────
    // 5. Peak Hours
    // ──────────────────────────────────────────────

    async getPeakHours(
        date?: string,
        startDate?: string,
        endDate?: string,
        filterType?: string,
        filterValue?: string,
    ): Promise<KitchenPeakHoursDto> {
        if (date) this.validateDateParam(date, 'date');
        if (startDate) this.validateDateParam(startDate, 'startDate');
        if (endDate) this.validateDateParam(endDate, 'endDate');

        const cacheKey = this.buildCacheKey('peak-hours', date, startDate, endDate, filterType, filterValue);
        const cached = await this.cacheService.get<KitchenPeakHoursDto>(cacheKey);
        if (cached) return cached;

        const { start, end } = this.getDateRange(date, startDate, endDate, filterType, filterValue);
        const tokens = await this.getKitchenTokens(start, end);

        // Initialize all 24 hours
        const hourMap = new Map<number, { orderCount: number; totalSales: number }>();
        for (let h = 0; h < 24; h++) {
            hourMap.set(h, { orderCount: 0, totalSales: 0 });
        }

        for (const token of tokens) {
            const hour = moment(token.createdAt).tz('Asia/Dhaka').hour();
            const entry = hourMap.get(hour)!;
            entry.orderCount += 1;
            entry.totalSales += this.getTokenSales(token);
        }

        const hours: PeakHourItemDto[] = Array.from(hourMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([hour, data]) => ({
                hour,
                orderCount: data.orderCount,
                totalSales: Math.round(data.totalSales * 100) / 100,
            }));

        const result: KitchenPeakHoursDto = { hours };

        await this.cacheService.set(cacheKey, result, CACHE_TTL);
        return result;
    }

    // ──────────────────────────────────────────────
    // 6. Kitchen vs Bar Comparison
    // ──────────────────────────────────────────────

    async getComparison(
        date?: string,
        startDate?: string,
        endDate?: string,
        filterType?: string,
        filterValue?: string,
    ): Promise<KitchenComparisonDto> {
        if (date) this.validateDateParam(date, 'date');
        if (startDate) this.validateDateParam(startDate, 'startDate');
        if (endDate) this.validateDateParam(endDate, 'endDate');

        const cacheKey = this.buildCacheKey('comparison', date, startDate, endDate, filterType, filterValue);
        const cached = await this.cacheService.get<KitchenComparisonDto>(cacheKey);
        if (cached) return cached;

        const { start, end } = this.getDateRange(date, startDate, endDate, filterType, filterValue);
        const allTokens = await this.getAllTokens(start, end);

        const kitchenTokens = allTokens.filter(t => t.token_type === TokenType.KITCHEN);
        const barTokens = allTokens.filter(t => t.token_type === TokenType.BAR);

        const buildMetrics = (tokens: OrderToken[]): SectionMetricsDto => {
            const sales = tokens.reduce((sum, token) => sum + this.getTokenSales(token), 0);
            const orders = tokens.length;
            const avgOrderValue = orders > 0 ? sales / orders : 0;

            const prepTimes = tokens
                .map(t => this.calculatePrepTimeMinutes(t))
                .filter((t): t is number => t !== null && t >= 0);
            const avgPrepTime = prepTimes.length > 0
                ? prepTimes.reduce((s, t) => s + t, 0) / prepTimes.length
                : 0;

            return {
                sales: Math.round(sales * 100) / 100,
                orders,
                avgOrderValue: Math.round(avgOrderValue * 100) / 100,
                avgPrepTime: Math.round(avgPrepTime * 100) / 100,
            };
        };

        const result: KitchenComparisonDto = {
            kitchen: buildMetrics(kitchenTokens),
            bar: buildMetrics(barTokens),
        };

        await this.cacheService.set(cacheKey, result, CACHE_TTL);
        return result;
    }
}
