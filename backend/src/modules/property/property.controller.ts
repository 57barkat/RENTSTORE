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
  @UseInterceptors(FileFieldsInterceptor([{ name: "photos", maxCount: 10 }]))
  async createProperty(
    @Body() dto: any,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
    @Req() req: any
  ) {
    const photos = files?.photos || [];
    console.log("📸 Uploaded files:", photos.length);

    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");

    // 🧠 Parse any fields that might be JSON strings
    const parsedDto = {
      ...dto,
      address:
        typeof dto.address === "string" 
          ? JSON.parse(dto.address) 
          : dto.address,
      capacityState:
        typeof dto.capacityState === "string"
          ? JSON.parse(dto.capacityState)
          : dto.capacityState,
      description:
        typeof dto.description === "string"
          ? JSON.parse(dto.description)
          : dto.description,
      safetyDetailsData:
        typeof dto.safetyDetailsData === "string"
          ? JSON.parse(dto.safetyDetailsData)
          : dto.safetyDetailsData,
      amenities:
        typeof dto.amenities === "string"
          ? JSON.parse(dto.amenities)
          : dto.amenities,
    };

    return this.propertyService.create(parsedDto, photos, userId);
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

    // Convert numeric filters from string to number
    const numericFields = [
      "page",
      "limit",
      "minRent",
      "maxRent",
      "minSecurity",
      "maxSecurity",
      "bedrooms",
      "bathrooms",
      "guests",
    ];
    numericFields.forEach((field) => {
      if (query[field] !== undefined) query[field] = Number(query[field]);
    });

    // Convert array filters (amenities, bills, highlighted, safety) from comma-separated string to array
    const arrayFields = ["amenities", "bills", "highlighted", "safety"];
    arrayFields.forEach((field) => {
      if (query[field] && typeof query[field] === "string") {
        query[field] = query[field].split(",").map((v) => v.trim());
      }
    });

    const page = query.page || 1;
    const limit = query.limit || 10;

    // Remove pagination params from query before sending to service
    const filters = { ...query };
    delete filters.page;
    delete filters.limit;

    return this.propertyService.findFiltered(page, limit, filters, userId);
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
    const userId = req.user.userId;
    return this.propertyService.findMyProperties(userId);
  }

  @Get("featured")
  async getFeaturedProperties(@Req() req: any) {
    const userId = req.user?.userId;
    return this.propertyService.getFeaturedProperties(userId);
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
