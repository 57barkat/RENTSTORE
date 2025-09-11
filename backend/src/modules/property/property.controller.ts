import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
  Param,
  Patch,
  Delete,
  Query,
} from "@nestjs/common";
import { PropertyService } from "./property.service";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard("jwt"))
@Controller("properties")
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post("create")
  @UseInterceptors(FileFieldsInterceptor([{ name: "images", maxCount: 10 }]))
  async createProperty(
    @Body() dto: CreatePropertyDto,
    @UploadedFiles()
    files: { images?: Express.Multer.File[] },
    @Req() req: any
  ) {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException("User not authenticated");
    }

    const userId = req.user.userId;
    const imageFiles = files.images || [];
    const property = await this.propertyService.create(dto, imageFiles, userId);

    return property;
  }

  @Get()
  async getAll(@Query("page") page?: number, @Query("limit") limit?: number) {
    return this.propertyService.findAll(Number(page) || 1, Number(limit) || 10);
  }
  @Get("search")
  async searchProperties(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("city") city?: string,
    @Query("minRent") minRent?: number,
    @Query("maxRent") maxRent?: number,
    @Query("bedrooms") bedrooms?: number,
    @Query("propertyType") propertyType?: string
  ) {
    return this.propertyService.findFiltered(
      Number(page) || 1,
      Number(limit) || 10,
      city,
      minRent ? Number(minRent) : undefined,
      maxRent ? Number(maxRent) : undefined,
      bedrooms ? Number(bedrooms) : undefined,
      propertyType
    );
  }
  @Get("filters")
  async getFilterOptions() {
    return this.propertyService.getFilterOptions();
  }

  @Get("my-listings")
  async getMyProperties(@Req() req: any) {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException(
        "User not authenticated not a valid user"
      );
    }
    const result = await this.propertyService.findMyProperties(req.user.userId);
    return result;
  }

  @Get("featured")
  async getFeaturedProperties() {
    return this.propertyService.getFeaturedProperties();
  }
  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.propertyService.findPropertyById(id);
  }

  @Patch(":id")
  async updateProperty(
    @Param("id") id: string,
    @Body() dto: Partial<CreatePropertyDto>,
    @Req() req: any
  ) {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException("User not authenticated");
    }
    return this.propertyService.updateProperty(id, dto, req.user.userId);
  }
  @Delete(":id")
  async deleteProperty(@Param("id") id: string) {
    return this.propertyService.findPropertyByIdAndDelete(id);
  }
}
