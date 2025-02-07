import { Exclude } from 'class-transformer';
import { Employee } from 'src/employee/entities/employee.entity';
import { File } from 'src/file/entities/file.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm';

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
    enum: ['free tier', 'basic', 'premium'],
    default: null
  })
  subscriptionPlan: string;

  @Column({ type: 'date', nullable: true, default: null })
  subscriptionStartDate: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  billingAmount: number;

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => Employee, (employee) => employee.company)
  employees: Employee[];

  @OneToMany(() => File, (file) => file.company)
  uploadedFiles: File[];
}