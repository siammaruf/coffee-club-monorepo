import { DailyReport } from "../entities/report.entity";

export class DailyReportResponseDto {
    id: string;
    report_date: Date;
    total_sales: number;
    bar_sales: number;
    kitchen_sales: number;
    total_orders: number;
    bar_orders: number;
    kitchen_orders: number;
    total_expenses: number;
    total_expense_items: number;
    credit_amount: number;
    is_auto_generated: boolean;
    created_at: Date;
    updated_at: Date;

    constructor(entity: DailyReport) {
        this.id = entity.id;
        this.report_date = entity.report_date;
        this.total_sales = Number(entity.total_sales);
        this.bar_sales = Number(entity.bar_sales);
        this.kitchen_sales = Number(entity.kitchen_sales);
        this.total_orders = entity.total_orders;
        this.bar_orders = entity.bar_orders;
        this.kitchen_orders = entity.kitchen_orders;
        this.total_expenses = Number(entity.total_expenses);
        this.total_expense_items = entity.total_expense_items;
        this.credit_amount = Number(entity.credit_amount);
        this.is_auto_generated = entity.is_auto_generated;
        this.created_at = entity.created_at;
        this.updated_at = entity.updated_at;
    }
}