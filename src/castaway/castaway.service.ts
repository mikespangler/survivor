import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCastawayDto } from './dto/create-castaway.dto';
import { UpdateCastawayDto } from './dto/update-castaway.dto';

@Injectable()
export class CastawayService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCastawayDto: CreateCastawayDto) {
    const season = await this.prisma.season.findUnique({
      where: { id: createCastawayDto.seasonId },
    });

    if (!season) {
      throw new NotFoundException(
        `Season with ID ${createCastawayDto.seasonId} not found`,
      );
    }

    return this.prisma.castaway.create({
      data: createCastawayDto,
      include: { season: true },
    });
  }

  findAll(seasonId: string) {
    if (!seasonId) {
      throw new BadRequestException('seasonId query parameter is required');
    }

    return this.prisma.castaway.findMany({
      where: { seasonId },
      orderBy: { name: 'asc' },
      include: { season: true },
    });
  }

  async findOne(id: string) {
    const castaway = await this.prisma.castaway.findUnique({
      where: { id },
      include: { season: true },
    });

    if (!castaway) {
      throw new NotFoundException(`Castaway with ID ${id} not found`);
    }

    return castaway;
  }

  async update(id: string, updateCastawayDto: UpdateCastawayDto) {
    const existing = await this.findOne(id);

    // Prevent season reassignment to avoid cross-season inconsistencies
    const data = { ...updateCastawayDto };
    if (data.seasonId && data.seasonId !== existing.seasonId) {
      throw new BadRequestException('Castaway season cannot be changed');
    }
    delete data.seasonId;

    return this.prisma.castaway.update({
      where: { id },
      data,
      include: { season: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.castaway.delete({
      where: { id },
    });
  }
}
