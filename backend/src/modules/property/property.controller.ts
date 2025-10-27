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
    @Body() dto: CreatePropertyDto,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
    @Req() req: any
  ) {
    const photos = files?.photos || [];
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");

    const parsedDto = {
      ...dto,
      address: this.parseJson(dto.address),
      capacityState: this.parseJson(dto.capacityState),
      description: this.parseJson(dto.description),
      safetyDetailsData: this.parseJson(dto.safetyDetailsData),
      amenities: this.parseJson(dto.amenities),
    };

    // Required fields for full completion
    const requiredFields = [
      "title",
      "hostOption",
      "location",
      "monthlyRent",
      "SecuritybasePrice",
      "address",
      "capacityState",
    ];

    const isComplete = requiredFields.every((field) => !!parsedDto[field]);

    // 👇 Automatically set property status: true (complete) / false (draft)
    parsedDto.status = isComplete;

    return this.propertyService.create(parsedDto, photos, userId);
  }

  private parseJson(value: any) {
    try {
      return typeof value === "string" ? JSON.parse(value) : value;
    } catch {
      return value;
    }
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

  @Delete("drafts/:id")
  async deleteDraftById(@Param("id") id: string, @Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");
    return this.propertyService.deleteDraftById(id, userId);
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
