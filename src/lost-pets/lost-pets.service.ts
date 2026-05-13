import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisCacheService } from '../cache/redis-cache.service';
import { createPoint, getCoordinates } from '../common/utils/geo.util';
import { trackEvent, trackException } from '../telemetry/application-insights';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';
import { LostPet } from './entities/lost-pet.entity';

@Injectable()
export class LostPetsService {
  private readonly logger = new Logger(LostPetsService.name);
  private readonly activeLostPetsCacheKey = 'lost-pets:active';

  constructor(
    @InjectRepository(LostPet)
    private readonly lostPetsRepository: Repository<LostPet>,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findActive() {
    const cachedLostPets = await this.redisCacheService.get(
      this.activeLostPetsCacheKey,
    );

    if (cachedLostPets) {
      trackEvent('lost_pets_cache_hit');
      return cachedLostPets;
    }

    const lostPets = await this.lostPetsRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });
    const response = lostPets.map((lostPet) => this.toResponse(lostPet));

    await this.redisCacheService.set(this.activeLostPetsCacheKey, response);
    trackEvent('lost_pets_cache_miss', { count: String(response.length) });

    return response;
  }

  async create(createLostPetDto: CreateLostPetDto) {
    try {
      const lostPet = this.lostPetsRepository.create({
        name: createLostPetDto.name,
        species: createLostPetDto.species,
        breed: createLostPetDto.breed,
        color: createLostPetDto.color,
        size: createLostPetDto.size,
        description: createLostPetDto.description,
        photo_url: createLostPetDto.photo_url ?? null,
        owner_name: createLostPetDto.owner_name,
        owner_email: createLostPetDto.owner_email,
        owner_phone: createLostPetDto.owner_phone,
        location: createPoint(
          createLostPetDto.longitude,
          createLostPetDto.latitude,
        ),
        address: createLostPetDto.address,
        lost_date: new Date(createLostPetDto.lost_date),
        is_active: true,
      });

      const savedLostPet = await this.lostPetsRepository.save(lostPet);
      await this.redisCacheService.del(this.activeLostPetsCacheKey);
      trackEvent('lost_pet_created', {
        id: String(savedLostPet.id),
        species: savedLostPet.species,
      });

      return this.toResponse(savedLostPet);
    } catch (error) {
      trackException(error);
      this.logger.error(
        'Unable to create lost pet record',
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Unable to create lost pet record',
      );
    }
  }

  private toResponse(lostPet: LostPet) {
    const { location, ...rest } = lostPet;

    return {
      ...rest,
      ...getCoordinates(location),
    };
  }
}
