import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Ensure user exists

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure user exists

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findByClerkId(clerkId: string) {
    return this.prisma.user.findUnique({
      where: { clerkId },
    });
  }

  async upsertFromClerk(clerkUser: {
    clerkId: string;
    email: string | null;
    name: string | null;
  }) {
    // Try to find existing user by clerkId
    const existingUser = await this.findByClerkId(clerkUser.clerkId);

    if (existingUser) {
      // Update existing user with latest info from Clerk
      return this.prisma.user.update({
        where: { clerkId: clerkUser.clerkId },
        data: {
          email: clerkUser.email,
          name: clerkUser.name,
        },
      });
    }

    // Create new user (Just-in-Time sync)
    return this.prisma.user.create({
      data: {
        clerkId: clerkUser.clerkId,
        email: clerkUser.email,
        name: clerkUser.name,
        systemRole: 'user', // Default role for new users
      },
    });
  }
}

