import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Point } from 'geojson';

@Entity({ name: 'found_pets' })
export class FoundPet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  species: string;

  @Column({ type: 'varchar', nullable: true })
  breed: string | null;

  @Column({ type: 'varchar' })
  color: string;

  @Column({ type: 'varchar' })
  size: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  photo_url: string | null;

  @Column({ type: 'varchar' })
  finder_name: string;

  @Column({ type: 'varchar' })
  finder_email: string;

  @Column({ type: 'varchar' })
  finder_phone: string;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Point;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'timestamp without time zone' })
  found_date: Date;

  @CreateDateColumn({ type: 'timestamp without time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp without time zone' })
  updated_at: Date;
}
