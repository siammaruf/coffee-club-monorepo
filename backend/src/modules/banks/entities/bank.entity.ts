import { User } from "src/modules/users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('banks')
export class Bank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bank_name: string;

  @Column()
  branch_name: string;

  @Column()
  account_number: string;

  @Column()
  routing_number: string;
  
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  
  @CreateDateColumn()
  created_at: Date;
  
  @UpdateDateColumn()
  updated_at: Date;
}