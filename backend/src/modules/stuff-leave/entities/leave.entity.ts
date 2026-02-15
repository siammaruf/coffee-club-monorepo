import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, DeleteDateColumn } from "typeorm";
import { LeaveStatus } from "../enum/leave-status.enum";
import { User } from "../../users/entities/user.entity";

@Entity()
export class Leave {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column()
    user_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    leave_type: string;

    @Column()
    leave_start_date: Date;

    @Column()   
    leave_end_date: Date;

    @Column()
    reason: string;

    @Column({
        type: 'enum',
        enum: LeaveStatus,
        default: LeaveStatus.PENDING
    })
    status: LeaveStatus;

    @DeleteDateColumn()
    deleted_at: Date | null;
}