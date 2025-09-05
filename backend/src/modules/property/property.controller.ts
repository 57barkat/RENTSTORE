import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post('create')
  @UseInterceptors(FilesInterceptor('files'))
  async createProperty(
    @Body() dto: CreatePropertyDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    const userId =  "68b794ccaef3548ca126d88e";  
    return this.propertyService.create(dto, files, userId);
  }

  @Get()
  async getAll() {
    return this.propertyService.findAll();
  }

  @Get('my-listings')
  async getMyProperties(@Req() req: any) {
    return this.propertyService.findMyProperties(req.user.userId);
  }
}
