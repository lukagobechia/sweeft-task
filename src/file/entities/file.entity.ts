import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Company } from 'src/company/entities/company.entity';
import { Employee } from 'src/employee/entities/employee.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  key: string;

  @Column()
  url: string;

  @Column({ default: false })
  restricted: boolean;

  @Column('simple-array')
  allowedEmployees: string[];

  @ManyToOne(() => Company, (company) => company.uploadedFiles, { onDelete: 'CASCADE' })
  company: Company;

  @ManyToOne(() => Employee, (employee) => employee.uploadedFiles, { onDelete: 'CASCADE' })
  uploadedBy: Employee;
}