import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from "typeorm";
import { ExpenseStatus } from "../enum/expense-status.enum";
import { ExpenseCategory } from "../../expense-categories/entities/expense-categories.entity";

@Entity()
export class Expenses {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @ManyToOne(() => ExpenseCategory, { eager: true })
    @JoinColumn({ name: "category_id" })
    category: ExpenseCategory;

    @Column({nullable: true})
    description: string;

    @Column({ 
        type: 'enum',
        enum: ExpenseStatus,
        default: ExpenseStatus.PENDING
    })
    status: ExpenseStatus;

    @Column({ nullable: true })
    receipt_reference?: string;
    
    @DeleteDateColumn()
    deleted_at: Date | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}