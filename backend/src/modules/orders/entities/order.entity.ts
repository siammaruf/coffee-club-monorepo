import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, ManyToMany, JoinTable, OneToMany, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";
import { OrderType } from "../enum/order-type.enum";
import { OrderStatus } from "../enum/order-status.enum";
import { PaymentMethod } from "../enum/payment-method.enum";
import { Table } from "../../table/entities/table.entity";
import { Customer } from "../../customers/entities/customer.entity";
import { User } from "src/modules/users/entities/user.entity";
import type { OrderItem } from "../../order-items/entities/order-item.entity";
import type { OrderToken } from "../../order-tokens/entities/order-token.entity";
import { Discount } from "../../discount/entities/discount.entity";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: true })
    order_id: string;

    @Column({
        type: 'enum',
        enum: OrderType,
        default: OrderType.DINEIN,
    })
    order_type: OrderType;

    @ManyToMany(() => Table)
    @JoinTable({
        name: 'order_tables',
        joinColumn: { name: 'order_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'table_id', referencedColumnName: 'id' }
    })
    tables: Table[];

    @ManyToOne(() => Customer, { nullable: true })
    @JoinColumn({ name: 'customer_id' })
    customer?: Customer;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    sub_total: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    total_amount: number;

    @ManyToOne(() => Discount, { nullable: true })
    @JoinColumn({ name: 'discount_id' })
    discount?: Discount;

    @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2, default: 0 })
    discount_amount: number;

    @Column({ nullable: true, type: 'bigint' })
    completion_time: number;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.CASH,
        nullable:true
    })
    payment_method?: PaymentMethod;

    @Column({ default: 'pos' })
    order_source: string;

    @Column({ nullable: true, type: 'text' })
    delivery_address: string;

    @Column({ nullable: true, type: 'text' })
    special_instructions: string;

    @Column({ nullable: true })
    customer_phone: string;

    @OneToMany("OrderItem", "order")
    orderItems: Relation<OrderItem[]>;

    @OneToMany("OrderToken", "order")
    orderTokens: Relation<OrderToken[]>;

    @DeleteDateColumn()
    deleted_at: Date | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}