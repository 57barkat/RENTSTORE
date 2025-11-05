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
import { CreatePropertyDto, RentFilter } from "./dto/create-property.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard("jwt"))
@Controller("properties")
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  private parseJson(val: any) {
    if (!val) return undefined;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return val; // return raw string if parse fails
      }
    }
    return val;
  }

  @UseInterceptors(FileFieldsInterceptor([{ name: "photos", maxCount: 10 }]))
  @Post()
  async createOrUpdateProperty(
    @Body() dto: CreatePropertyDto,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
    @Req() req: any
  ) {
    console.log(req.body)
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");

    const photos = files?.photos || []; // Corrected DTO parsing to align with the new schema field names

    const parsedDto = {
      ...dto,
      location: this.parseJson(dto.location) || {},
      capacity: this.parseJson(dto.capacity) || {},
      description: this.parseJson(dto.description) || {}, // Corrected field name: safetyDetailsData -> safetyFeatures
      safetyFeatures: this.parseJson(dto.safetyFeatures as any) || [],
      amenities: this.parseJson(dto.amenities as any) || [],
      billsIncluded: this.parseJson((dto as any).billsIncluded) || [],
      photos: this.parseJson((dto as any).photos) || [], // rentRates is a crucial JSON field that needs parsing
      rentRates: this.parseJson((dto as any).rentRates) || [],
    };

    return this.propertyService.createOrUpdate(parsedDto, photos, userId);
  }

  @Get()
  async getAll(
    @Req() req: any,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    const userId = req.user?.userId;
    return this.propertyService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      userId
    );
  }

  @Get("search")
  async searchProperties(@Req() req: any, @Query() query: Record<string, any>) {
    const userId = req.user?.userId;

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const rentFilter: RentFilter = {
      rentType: query.rentType?.toLowerCase() as "daily" | "weekly" | "monthly",
      minAmount: query.minRent ? Number(query.minRent) : undefined,
      maxAmount: query.maxRent ? Number(query.maxRent) : undefined,
    };

    // General filters
    const filters: Record<string, any> = {
      propertyType: query.propertyType?.toLowerCase(),
      city: query.city,
      beds: query.beds ? Number(query.beds) : undefined,
    };

    return this.propertyService.findFiltered(
      page,
      limit,
      filters,
      userId,
      rentFilter
    );
  }

  @Get("my-listings")
  async getMyProperties(@Req() req: any) {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException(
        "User not authenticated not a valid user"
      );
    }
    const userId = req.user.userId;
    return this.propertyService.findMyProperties(userId);
  }

  @Get("featured")
  async getFeaturedProperties(@Req() req: any) {
    const userId = req.user?.userId;
    return this.propertyService.getFeaturedProperties(userId);
  }
  @Get("drafts")
  async getAllDrafts(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");
    return this.propertyService.getAllDrafts(userId);
  }

  @Get(":id")
  async findById(@Param("id") id: string, @Req() req: any) {
    const userId = req.user?.userId;
    return this.propertyService.findPropertyById(id, userId);
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
