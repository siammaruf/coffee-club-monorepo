import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { VendorPaymentType } from '../enum/vendor-payment-type.enum';

@Entity('vendor_payments')
export class VendorPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  payment_date: string;

  @Column({ type: 'enum', enum: VendorPaymentType })
  payment_type: VendorPaymentType;

  @Column({ nullable: true, type: 'text' })
  note: string | null;

  @Column({ type: 'varchar', nullable: true })
  screenshot_url: string | null;

  @Column({ type: 'uuid', nullable: true })
  created_by_id: string | null;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
