import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, DeleteDateColumn } from "typeorm";
import { KitchenItems } from "../../kitchen-items/entities/kitchen-item.entity";

@Entity('kitchen_stock')
export class KitchenStock {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => KitchenItems, { eager: true })
    @JoinColumn({ name: "kitchen_item_id" })
    kitchen_item: KitchenItems;

    @Column()
    quantity: number;

    @Column({type: 'decimal', precision: 10, scale: 2})
    price: number;

    @Column({type: 'decimal', precision: 10, scale: 2})
    total_price: number;

    @Column({nullable: true})
    description: string;

    @DeleteDateColumn()
    deleted_at: Date | null;

    @Column({ nullable: true })
    created_at: Date;

    @Column({ nullable: true })
    updated_at: Date;
}