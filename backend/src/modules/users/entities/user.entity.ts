/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserStatus } from "../enum/user-status.enum";
import { UserRole } from "../enum/user-role.enum";
import { IsString, MinLength } from "class-validator";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({unique: true, nullable: true})
  email: string;

  @Column({unique: true})
  phone: string;

  @Column({unique: true, nullable: true})
  nid_number: string;

  @Column({nullable: true})
  nid_front_picture: string;

  @Column({nullable: true})
  nid_back_picture: string;

  @Column({nullable: true})
  address: string;

  @Column({nullable: true})
  date_joined: Date;

  @IsString()
  @MinLength(6)
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUFF
  })
  role: UserRole;

  @Column({nullable: true})
  picture: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Base salary amount for the user'
  })
  base_salary: number;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}