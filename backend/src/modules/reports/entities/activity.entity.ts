import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';

export enum ActivityType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  KITCHEN_ORDER_CREATED = 'KITCHEN_ORDER_CREATED',
  KITCHEN_ORDER_APPROVED = 'KITCHEN_ORDER_APPROVED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  CUSTOMER_CREATED = 'CUSTOMER_CREATED',
  CUSTOMER_UPDATED = 'CUSTOMER_UPDATED',
  EXPENSE_CREATED = 'EXPENSE_CREATED',
  EXPENSE_UPDATED = 'EXPENSE_UPDATED',
  STAFF_CHECK_IN = 'STAFF_CHECK_IN',
  STAFF_CHECK_OUT = 'STAFF_CHECK_OUT',
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  DISCOUNT_APPLIED = 'DISCOUNT_APPLIED',
  TABLE_ASSIGNED = 'TABLE_ASSIGNED',
  TABLE_RELEASED = 'TABLE_RELEASED',
  ITEM_CREATED = 'ITEM_CREATED',
  ITEM_UPDATED = 'ITEM_UPDATED',
  STOCK_UPDATED = 'STOCK_UPDATED'
}

@Entity('activities')
@Index(['activity_type'])
@Index(['created_at'])
@Index(['user'])
@Index(['entity_type', 'entity_id'])
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
    comment: 'Type of activity performed'
  })
  activity_type: ActivityType;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Description of the activity'
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Type of entity involved (order, customer, user, etc.)'
  })
  entity_type: string;

  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'ID of the entity involved'
  })
  entity_id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Customer, { onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Additional metadata about the activity'
  })
  metadata: Record<string, any>;

  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: 'IP address from where the activity was performed'
  })
  ip_address: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'User agent string'
  })
  user_agent: string;

  @CreateDateColumn({ comment: 'Timestamp when activity was recorded' })
  created_at: Date;

  @UpdateDateColumn({ comment: 'Timestamp when record was last updated' })
  updated_at: Date;
}