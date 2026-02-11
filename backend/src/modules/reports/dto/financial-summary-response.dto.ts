export class FinancialSummaryResponseDto {
    total_sales: number;
    total_expenses: number;
    total_credit: number;
    current_fund: number;
    total_orders: number;
    total_expense_items: number;
    bar_sales: number;
    kitchen_sales: number;
    summary_date: Date;

    constructor(data: any) {
        this.total_sales = Number(data.total_sales);
        this.total_expenses = Number(data.total_expenses);
        this.total_credit = Number(data.total_credit);
        this.current_fund = Number(data.current_fund);
        this.total_orders = data.total_orders;
        this.total_expense_items = data.total_expense_items;
        this.bar_sales = Number(data.bar_sales);
        this.kitchen_sales = Number(data.kitchen_sales);
        this.summary_date = data.summary_date;
    }
}