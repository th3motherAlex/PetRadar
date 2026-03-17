import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createPoint, getCoordinates } from '../common/utils/geo.util';
import { MailService } from '../mail/mail.service';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';
import { FoundPet } from './entities/found-pet.entity';

type LostPetMatch = {
  id: number;
  name: string;
  species: string;
  breed: string;
  color: string;
  size: string;
  description: string;
  photo_url: string | null;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  address: string;
  lost_date: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  latitude: number;
  longitude: number;
  distance_meters: number;
};

@Injectable()
export class FoundPetsService {
  private readonly logger = new Logger(FoundPetsService.name);
  private readonly matchRadiusInMeters = 500;

  constructor(
    @InjectRepository(FoundPet)
    private readonly foundPetsRepository: Repository<FoundPet>,
    private readonly mailService: MailService,
  ) {}

  async create(createFoundPetDto: CreateFoundPetDto) {
    try {
      const foundPet = this.foundPetsRepository.create({
        species: createFoundPetDto.species,
        breed: createFoundPetDto.breed ?? null,
        color: createFoundPetDto.color,
        size: createFoundPetDto.size,
        description: createFoundPetDto.description,
        photo_url: createFoundPetDto.photo_url ?? null,
        finder_name: createFoundPetDto.finder_name,
        finder_email: createFoundPetDto.finder_email,
        finder_phone: createFoundPetDto.finder_phone,
        location: createPoint(
          createFoundPetDto.longitude,
          createFoundPetDto.latitude,
        ),
        address: createFoundPetDto.address,
        found_date: new Date(createFoundPetDto.found_date),
      });

      const savedFoundPet = await this.foundPetsRepository.save(foundPet);
      const matchedLostPets = await this.findNearbyLostPets(
        createFoundPetDto.longitude,
        createFoundPetDto.latitude,
      );

      const notificationResults = await Promise.allSettled(
        matchedLostPets.map((match) =>
          this.mailService.sendFoundPetMatchNotification({
            lostPet: match,
            foundPet: this.toResponse(savedFoundPet),
          }),
        ),
      );

      const notificationsSent = notificationResults.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const notificationsFailed = notificationResults.length - notificationsSent;

      if (notificationsFailed > 0) {
        this.logger.warn(
          `${notificationsFailed} notification email(s) failed to send`,
        );
      }

      return {
        found_pet: this.toResponse(savedFoundPet),
        matches_found: matchedLostPets.length,
        notifications_sent: notificationsSent,
        notifications_failed: notificationsFailed,
      };
    } catch (error) {
      this.logger.error(
        'Unable to create found pet record',
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Unable to create found pet record',
      );
    }
  }

  private async findNearbyLostPets(
    longitude: number,
    latitude: number,
  ): Promise<LostPetMatch[]> {
    const matches = await this.foundPetsRepository.query(
      `
        SELECT
          lp.*,
          ST_Y(lp.location) AS latitude,
          ST_X(lp.location) AS longitude,
          ST_Distance(
            lp.location::geography,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          ) AS distance_meters
        FROM lost_pets lp
        WHERE lp.is_active = true
          AND ST_DWithin(
            lp.location::geography,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            $3
          )
        ORDER BY distance_meters ASC;
      `,
      [longitude, latitude, this.matchRadiusInMeters],
    );

    return matches.map((match: Record<string, unknown>) => ({
      id: Number(match.id),
      name: String(match.name),
      species: String(match.species),
      breed: String(match.breed),
      color: String(match.color),
      size: String(match.size),
      description: String(match.description),
      photo_url:
        match.photo_url === null ? null : String(match.photo_url),
      owner_name: String(match.owner_name),
      owner_email: String(match.owner_email),
      owner_phone: String(match.owner_phone),
      address: String(match.address),
      lost_date: new Date(String(match.lost_date)),
      is_active: Boolean(match.is_active),
      created_at: new Date(String(match.created_at)),
      updated_at: new Date(String(match.updated_at)),
      latitude: Number(match.latitude),
      longitude: Number(match.longitude),
      distance_meters: Number(match.distance_meters),
    }));
  }

  private toResponse(foundPet: FoundPet) {
    const { location, ...rest } = foundPet;

    return {
      ...rest,
      ...getCoordinates(location),
    };
  }
}
