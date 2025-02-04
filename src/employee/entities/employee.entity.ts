import { Exclude } from 'class-transformer';
import { Company } from 'src/company/entities/company.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  firstName: string;

  @Column({ type: 'varchar', length: 30 })
  lastName: string;

  @Column({ type: 'varchar', length: 40 })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({
    default: 'employee',
  })
  role: string;

  @Column({ default: false })
  isActive: boolean;

  @Exclude()
  @ManyToOne(() => Company, (company) => company.employees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;
}