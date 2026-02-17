import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, DeleteDateColumn, UpdateDateColumn, Relation } from "typeorm";
import type { KitchenOrderItem } from "./kitchen-order-item.entity";
import { User } from "../../users/entities/user.entity";

@Entity('kitchen_orders')
export class KitchenOrder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: true })
    order_id: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @OneToMany("KitchenOrderItem", "kitchen_order", { cascade: true })
    order_items: Relation<KitchenOrderItem[]>;

    @Column({type:'decimal', precision: 10, scale: 2, nullable: true, default: 0})
    total_amount: number;

    @Column({nullable: true, default: false})
    is_approved: boolean;

    @Column({nullable: true})
    description: string;
    
    @DeleteDateColumn()
    deleted_at: Date | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}