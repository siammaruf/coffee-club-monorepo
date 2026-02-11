import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('daily_reports')
export class DailyReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'date', unique: true })
    report_date: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    total_sales: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    bar_sales: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    kitchen_sales: number;

    @Column({ type: 'int', default: 0 })
    total_orders: number;

    @Column({ type: 'int', default: 0 })
    bar_orders: number;

    @Column({ type: 'int', default: 0 })
    kitchen_orders: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    total_expenses: number;

    @Column({ type: 'int', default: 0 })
    total_expense_items: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    credit_amount: number; 

    @Column({ type: 'boolean', default: false })
    is_auto_generated: boolean;

    @Column({ type: 'timestamp', nullable: true })
    generated_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}