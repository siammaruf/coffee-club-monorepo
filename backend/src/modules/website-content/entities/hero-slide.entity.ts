import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('hero_slides')
export class HeroSlide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', default: 'centered' })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true })
  subtitle: string | null;

  @Column({ type: 'varchar', nullable: true })
  heading: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'boolean', default: false })
  show_cta: boolean;

  @Column({ type: 'boolean', default: false })
  bg_image: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
