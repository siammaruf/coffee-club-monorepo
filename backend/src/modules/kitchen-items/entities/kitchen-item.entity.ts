import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { KitchenItemType } from "../enum/kitchen-item-type.enum";

@Entity('kitchen_items')   
export class KitchenItems {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    name_bn: string;

    @Column()
    slug: string;

    @Column({ nullable: true })     
    image: string;

    @Column({ nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: KitchenItemType,
        default: KitchenItemType.KITCHEN
    })
    type: KitchenItemType;

    @Column({ nullable: true })
    created_at: Date;
    
    @Column({ nullable: true }) 
    updated_at: Date;
}