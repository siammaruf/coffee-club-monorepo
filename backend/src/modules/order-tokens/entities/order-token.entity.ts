import type { OrderItem } from 'src/modules/order-items/entities/order-item.entity';
import type { Order } from 'src/modules/orders/entities/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, DeleteDateColumn, Relation, UpdateDateColumn } from 'typeorm';
import { OrderTokenPriority } from '../enum/OrderTokenPriority.enum';
import { OrderTokenStatus } from '../enum/OrderTokenStatus.enum';
import { TokenType } from '../enum/TokenType.enum';

@Entity('order_tokens')
export class OrderToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    token: string; 

    @Column({ type: 'enum', enum: TokenType })
    token_type: TokenType;

    @ManyToOne("Order", { nullable: false, onDelete: 'CASCADE' })
    order: Relation<Order>;

    @ManyToMany("OrderItem", { cascade: true })
    @JoinTable({ name: 'order_token_items' })
    order_items: Relation<OrderItem[]>;

    @Column({ type: 'enum', enum: OrderTokenPriority, default: OrderTokenPriority.NORMAL })
    priority: OrderTokenPriority;

    @Column({ type: 'enum', enum: OrderTokenStatus, default: OrderTokenStatus.PENDING })
    status: OrderTokenStatus;

    @Column({ type: 'timestamp', nullable: true })
    readyAt: Date;

    @DeleteDateColumn()
    deleted_at: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}