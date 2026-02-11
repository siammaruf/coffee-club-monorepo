import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DiscountType } from "../enum/discount-type.enum";

@Entity()
export class Discount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: DiscountType,  
        default: DiscountType.PERCENTAGE,
    })
    discount_type: DiscountType;
    
    @Column({ type: 'decimal', precision: 5, scale: 2 })
    discount_value: number;

    @Column()
    expiry_date: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}