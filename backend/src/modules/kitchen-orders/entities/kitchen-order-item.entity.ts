import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { KitchenOrder } from "./kitchen-order.entity";
import { KitchenStock } from "../../kitchen-stock/entities/kitchen-stock.entity";

@Entity('kitchen_order_items')
export class KitchenOrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => KitchenOrder, order => order.order_items)
    @JoinColumn({ name: "kitchen_order_id" })
    kitchen_order: KitchenOrder;

    @ManyToOne(() => KitchenStock, { eager: true })
    @JoinColumn({ name: "kitchen_stock_id" })
    kitchen_stock: KitchenStock;

    @Column({type:'decimal', precision: 10, scale: 2})
    quantity: number;

    @Column({type:'decimal', precision: 10, scale: 2})
    unit_price: number;

    @Column({type:'decimal', precision: 10, scale: 2})
    total_price: number;

    @Column({ nullable: true })
    created_at: Date;
    
    @Column({ nullable: true })
    updated_at: Date;
}