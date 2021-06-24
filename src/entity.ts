import { EntityModel } from '@midwayjs/orm';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@EntityModel('flyway_history')
@Entity('flyway_history')
export class FlywayHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '文件名', length: 100 })
  name: string;

  @Column({ comment: 'hash', length: 32 })
  hash: string;

  @Column({
    comment: '执行时间',
  })
  timestamp: Date;

  @Column({
    comment: '执行成功',
    default: true,
  })
  success: boolean;
}
