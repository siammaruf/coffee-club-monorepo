import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from "typeorm";
import { TableStatus } from "../enum/table-status.enum";

@Entity('tables')
export class Table {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    number: string;

    @Column()
    seat: number;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    location?: string;

    @Column({
        type: 'enum',
        enum: TableStatus,
        default: TableStatus.AVAILABLE
    })
    status: TableStatus;

    @DeleteDateColumn()
    deleted_at: Date | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}