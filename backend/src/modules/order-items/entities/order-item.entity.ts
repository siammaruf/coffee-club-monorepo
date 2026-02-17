import { Item } from "../../items/entities/item.entity";
import { ItemVariation } from "../../items/entities/item-variation.entity";
import type { Order } from "../../orders/entities/order.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";

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

    @ManyToOne("Order")
    @JoinColumn({ name: 'order_id' })
    order: Relation<Order>;

    @ManyToOne(() => Item, { eager: true })
    @JoinColumn({ name: 'item_id' })
    item: Item;

    @ManyToOne(() => ItemVariation, { eager: true, nullable: true })
    @JoinColumn({ name: 'variation_id' })
    variation: ItemVariation | null;

    @DeleteDateColumn()
    deleted_at: Date | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}