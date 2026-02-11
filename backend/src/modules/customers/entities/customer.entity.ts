import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Exclude } from "class-transformer";

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
    @Column({ nullable: true })
    refresh_token: string | null;

    @Column({ type: 'boolean', default: false })
    is_verified: boolean;

    @Exclude()
    @Column({ nullable: true })
    otp: string | null;

    @Column({ nullable: true, type: 'timestamp' })
    otp_expires_at: Date | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, nullable: true })
    points: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, nullable: true })
    balance: number;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}