import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Exclude } from "class-transformer";
import { CustomerType } from "../enum/customer-type.enum";

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({unique:true})
    phone: string;

    @Column({unique:true, nullable: true})
    email: string;

    @Column({nullable: true})
    address: string;

    @Column({ nullable: true })
    note: string;

    @Column({ nullable: true })
    picture: string;

    @Exclude()
    @Column({ nullable: true })
    password: string;

    @Exclude()
    @Column({ type: 'varchar', nullable: true })
    refresh_token: string | null;

    @Column({ type: 'boolean', default: false })
    is_verified: boolean;

    @Column({ type: 'enum', enum: CustomerType, default: CustomerType.REGULAR })
    customer_type: CustomerType;

    @Exclude()
    @Column({ type: 'varchar', nullable: true })
    otp: string | null;

    @Column({ nullable: true, type: 'timestamp' })
    otp_expires_at: Date | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, nullable: true })
    points: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, nullable: true })
    balance: number;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @DeleteDateColumn()
    deleted_at: Date | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}