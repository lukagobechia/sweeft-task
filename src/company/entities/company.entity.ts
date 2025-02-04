import { Exclude } from 'class-transformer';
import { Employee } from 'src/employee/entities/employee.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 40 })
  email: string;

  @Exclude()
  @Column({ type: 'varchar' })
  password: string;

  @Column({ default: 'company' })
  role: string;

  @Column({ type: 'varchar', length: 20 })
  country: string;

  @Column({ type: 'varchar', length: 20 })
  industry: string;

  @Column({
    type: 'enum',
    enum: ['free tier', 'basic', 'Premium'],
    default: null
  })
  plan: string;

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => Employee, (employee) => employee.company)
  employees: Employee[];
}