import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VendorType } from '../enum/vendor-type.enum';
import { VendorStatus } from '../enum/vendor-status.enum';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  vendor_name: string;

  @Column()
  contact_person: string;

  @Column({ type: 'enum', enum: VendorType })
  vendor_type: VendorType;

  @Column({ type: 'text' })
  address: string;

  @Column()
  mobile: string;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.ACTIVE })
  status: VendorStatus;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
