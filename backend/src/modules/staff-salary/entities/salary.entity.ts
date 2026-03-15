import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity()
export class Salary {
    @PrimaryGeneratedColumn('uuid')
    id: string; 

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ type: 'timestamp' })
    month: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    base_salary: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    bonus: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    deductions: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total_payble: number;

    @Column({nullable: true})
    receipt_image: string;
    
    @Column({default: false})
    is_paid: boolean;

    @Column({ nullable: true, type: 'text', comment: 'Additional notes or remarks about this salary record' })
    notes: string;
    
    @DeleteDateColumn()
    deleted_at: Date | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}