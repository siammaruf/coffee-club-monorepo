import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, DeleteDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AttendanceStatus } from '../enum/attendance-status.enum';

@Entity('stuff_attendance')
@Index(['user', 'attendance_date'], { unique: true }) 
@Index(['attendance_date']) 
@Index(['status']) 
export class StuffAttendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date', comment: 'Date of attendance record' })
  attendance_date: Date;

  @Column({ type: 'time', nullable: true, comment: 'Time when user checked in' })
  check_in: Date;

  @Column({ type: 'time', nullable: true, comment: 'Time when user checked out' })
  check_out: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
    comment: 'Attendance status for the day'
  })
  status: AttendanceStatus;

  @Column({ 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    default: 0,
    comment: 'Total work hours for the day'
  })
  work_hours: number;

  @Column({ 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    default: 0,
    comment: 'Overtime hours worked'
  })
  overtime_hours: number;

  @Column({ 
    type: 'text', 
    nullable: true,
    comment: 'Additional notes or remarks about attendance'
  })
  notes: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  @Column({ 
    type: 'uuid',
    nullable: true,
    comment: 'ID of the user who approved this attendance record'
  })
  approved_by: string;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Whether this attendance record has been approved'
  })
  is_approved: boolean;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @CreateDateColumn({ comment: 'Timestamp when record was created' })
  created_at: Date;

  @UpdateDateColumn({ comment: 'Timestamp when record was last updated' })
  updated_at: Date;
}