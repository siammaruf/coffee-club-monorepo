import { Item } from "../../items/entities/item.entity";
import { Order } from "../../orders/entities/order.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unit_price: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total_price: number;

    @ManyToOne(() => Order, { eager: true })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ManyToOne(() => Item, { eager: true })
    @JoinColumn({ name: 'item_id' })
    item: Item;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}