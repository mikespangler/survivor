import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEpisodeDto, UpdateEpisodeDto, BulkCreateEpisodesDto } from './dto';

@Injectable()
export class EpisodeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(seasonId?: string) {
    return this.prisma.episode.findMany({
      where: seasonId ? { seasonId } : undefined,
      orderBy: [{ seasonId: 'asc' }, { number: 'asc' }],
      include: {
        season: {
          select: {
            id: true,
            number: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id },
      include: {
        season: {
          select: {
            id: true,
            number: true,
            name: true,
          },
        },
      },
    });

    if (!episode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return episode;
  }

  async findBySeasonAndNumber(seasonId: string, number: number) {
    const episode = await this.prisma.episode.findUnique({
      where: {
        seasonId_number: {
          seasonId,
          number,
        },
      },
      include: {
        season: {
          select: {
            id: true,
            number: true,
            name: true,
          },
        },
      },
    });

    if (!episode) {
      throw new NotFoundException(
        `Episode ${number} for season ${seasonId} not found`,
      );
    }

    return episode;
  }

  async create(dto: CreateEpisodeDto) {
    // Verify season exists
    const season = await this.prisma.season.findUnique({
      where: { id: dto.seasonId },
    });

    if (!season) {
      throw new NotFoundException(`Season with ID ${dto.seasonId} not found`);
    }

    // Check if episode number already exists for this season
    const existing = await this.prisma.episode.findUnique({
      where: {
        seasonId_number: {
          seasonId: dto.seasonId,
          number: dto.number,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Episode ${dto.number} already exists for this season`,
      );
    }

    return this.prisma.episode.create({
      data: {
        seasonId: dto.seasonId,
        number: dto.number,
        airDate: dto.airDate ? new Date(dto.airDate) : null,
        title: dto.title,
      },
      include: {
        season: {
          select: {
            id: true,
            number: true,
            name: true,
          },
        },
      },
    });
  }

  async bulkCreate(dto: BulkCreateEpisodesDto) {
    // Verify season exists
    const season = await this.prisma.season.findUnique({
      where: { id: dto.seasonId },
    });

    if (!season) {
      throw new NotFoundException(`Season with ID ${dto.seasonId} not found`);
    }

    // Check for existing episodes
    const existingNumbers = await this.prisma.episode.findMany({
      where: {
        seasonId: dto.seasonId,
        number: { in: dto.episodes.map((e) => e.number) },
      },
      select: { number: true },
    });

    if (existingNumbers.length > 0) {
      const nums = existingNumbers.map((e) => e.number).join(', ');
      throw new ConflictException(
        `Episodes ${nums} already exist for this season`,
      );
    }

    // Create all episodes
    const created = await this.prisma.$transaction(
      dto.episodes.map((ep) =>
        this.prisma.episode.create({
          data: {
            seasonId: dto.seasonId,
            number: ep.number,
            airDate: ep.airDate ? new Date(ep.airDate) : null,
            title: ep.title,
          },
        }),
      ),
    );

    return created;
  }

  async update(id: string, dto: UpdateEpisodeDto) {
    const episode = await this.findOne(id);

    // If changing number, check for conflicts
    if (dto.number !== undefined && dto.number !== episode.number) {
      const existing = await this.prisma.episode.findUnique({
        where: {
          seasonId_number: {
            seasonId: episode.seasonId,
            number: dto.number,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Episode ${dto.number} already exists for this season`,
        );
      }
    }

    return this.prisma.episode.update({
      where: { id },
      data: {
        ...(dto.number !== undefined && { number: dto.number }),
        ...(dto.airDate !== undefined && {
          airDate: dto.airDate ? new Date(dto.airDate) : null,
        }),
        ...(dto.title !== undefined && { title: dto.title }),
      },
      include: {
        season: {
          select: {
            id: true,
            number: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.episode.delete({
      where: { id },
    });
  }

  async removeAllForSeason(seasonId: string) {
    return this.prisma.episode.deleteMany({
      where: { seasonId },
    });
  }
}
