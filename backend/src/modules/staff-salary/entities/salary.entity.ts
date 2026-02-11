import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity()
export class Salary {
    @PrimaryGeneratedColumn('uuid')
    id: string; 

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column()
    month: Date;
    
    @Column()
    base_salary: number;

    @Column({nullable: true})
    bonus: number;

    @Column({nullable: true})
    deductions: number;

    @Column()
    total_payble: number;

    @Column({nullable: true})
    receipt_image: string;
    
    @Column({default: false})
    is_paid: boolean;

    @Column({ nullable: true, type: 'text', comment: 'Additional notes or remarks about this salary record' })
    notes: string;
    
    @CreateDateColumn()
    created_at: Date;
    
    @UpdateDateColumn()
    updated_at: Date;
}