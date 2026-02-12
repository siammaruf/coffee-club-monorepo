import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  Relation,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import type { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany("CartItem", "cart", { cascade: true })
  items: Relation<CartItem[]>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
