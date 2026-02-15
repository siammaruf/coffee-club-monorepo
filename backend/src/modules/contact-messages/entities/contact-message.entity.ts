import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  subject: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', default: 'new' })
  status: string;

  @Column({ type: 'text', nullable: true })
  admin_reply: string | null;

  @Column({ type: 'timestamp', nullable: true })
  replied_at: Date | null;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
