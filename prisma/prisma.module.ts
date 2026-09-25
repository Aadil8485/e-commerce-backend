import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global() // Makes PrismaService available everywhere without importing PrismaModule
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Crucial for other modules to use it
})
export class PrismaModule {}
