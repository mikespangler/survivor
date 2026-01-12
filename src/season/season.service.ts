import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';

@Injectable()
export class SeasonService {
  constructor(private readonly prisma: PrismaService) {}

  create(createSeasonDto: CreateSeasonDto) {
    const data: any = { ...createSeasonDto };
    if (data.startDate) {
      data.startDate = new Date(data.startDate).toISOString();
    }

    return this.prisma.season.create({
      data,
    });
  }

  findAll() {
    return this.prisma.season.findMany({
      orderBy: {
        number: 'desc',
      },
      include: {
        castaways: true,
      },
    });
  }

  async findOne(id: string) {
    const season = await this.prisma.season.findUnique({
      where: { id },
      include: {
        castaways: true,
      },
    });

    if (!season) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }

    return season;
  }

  async update(id: string, updateSeasonDto: UpdateSeasonDto) {
    await this.findOne(id);

    const data: any = { ...updateSeasonDto };
    if (data.startDate) {
      data.startDate = new Date(data.startDate).toISOString();
    }

    return this.prisma.season.update({
      where: { id },
      data,
    });
  }

  async advanceEpisode(id: string) {
    const season = await this.findOne(id);

    if (season.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Season with ID ${id} is not ACTIVE. Current status: ${season.status}`,
      );
    }

    // Optional: Add check for max episodes if available
    // const maxEpisodes = await this.prisma.episode.count({ where: { seasonId: id } });
    // if (season.activeEpisode >= maxEpisodes) { ... }

    return this.prisma.season.update({
      where: { id },
      data: {
        activeEpisode: { increment: 1 },
      },
    });
  }

  async getMetadata(id: string) {
    const season = await this.prisma.season.findUnique({
      where: { id },
    });

    if (!season) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }

    // Get current episode details
    const currentEpisode = await this.prisma.episode.findUnique({
      where: {
        seasonId_number: {
          seasonId: id,
          number: season.activeEpisode,
        },
      },
    });

    return {
      id: season.id,
      number: season.number,
      name: season.name,
      status: season.status,
      startDate: season.startDate,
      activeEpisode: season.activeEpisode,
      currentEpisode: currentEpisode
        ? {
            number: currentEpisode.number,
            airDate: currentEpisode.airDate,
            title: currentEpisode.title,
            deadline: currentEpisode.airDate, // Same as airDate
          }
        : null,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.season.delete({
      where: { id },
    });
  }
}
