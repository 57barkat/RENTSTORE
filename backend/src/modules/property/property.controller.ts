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

interface PaginationQuery {
  page?: number;
  limit?: number;
}

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
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");

    console.log("🔥 RAW DTO from frontend:", req.body);

    // Helper to parse JSON safely
    const parseJson = (val: any) => {
      if (!val) return undefined;
      try {
        return typeof val === "string" ? JSON.parse(val) : val;
      } catch {
        return val;
      }
    };

    // Parse nested fields
    let parsedDto: any = {
      ...dto,
      capacityState: parseJson(dto.capacityState),
      description: parseJson(dto.description) ?? { highlighted: [] },
      safetyDetailsData: parseJson(dto.safetyDetailsData) ?? {
        safetyDetails: [],
      },
      amenities: parseJson(dto.amenities),
      ALL_BILLS: parseJson(dto.ALL_BILLS),
      lat: dto.lat ? Number(dto.lat) : undefined,
      lng: dto.lng ? Number(dto.lng) : undefined,
    };

    // Address handling
    let parsedAddress: any[] = [];
    if (dto.address) {
      try {
        parsedAddress =
          typeof dto.address === "string"
            ? JSON.parse(dto.address)
            : dto.address;
      } catch {
        parsedAddress = [];
      }

      parsedAddress = parsedAddress
        .map((addr) => {
          const cleaned: Record<string, any> = {};
          Object.keys(addr).forEach((key) => {
            const val = addr[key];
            cleaned[key] = typeof val === "string" ? val.trim() : val;
          });
          return cleaned;
        })
        .filter((a) => Object.keys(a).length > 0);
    }
    parsedDto.address = parsedAddress;

    // Status calculation
    const isFilled = (value: any): boolean => {
      if (value === null || value === undefined) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object")
        return Object.values(value).some((v) => isFilled(v));
      if (typeof value === "string") return value.trim() !== "";
      return true; // numbers, booleans
    };

    const requiredFields = [
      "hostOption",
      "location",
      "lat",
      "lng",
      "address",
      "safetyDetailsData",
    ];
    parsedDto.status = requiredFields.every((f) => isFilled(parsedDto[f]));

    // Photo upload
    const photoUrls = files?.photos?.length
      ? await Promise.all(
          files.photos.map((file) =>
            this.propertyService.cloudinary
              .uploadFile(file)
              .then((r) => r.secure_url)
          )
        )
      : dto.photos || [];
    parsedDto.photos = photoUrls;

    console.log("Parsed DTO for saving:", parsedDto);

    return this.propertyService.createOrUpdate(parsedDto, userId);
  }

  // 🔹 Get all properties with pagination
  @Get()
  async getAll(@Req() req: any, @Query() query: PaginationQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return this.propertyService.findAll(page, limit);
  }

  // 🔹 Get properties by hostOption (home, apartment, room)
  @Get("type/:hostOption")
  async getByHostOption(
    @Param("hostOption") hostOption: string,
    @Query() query: PaginationQuery,
    @Req() req: any
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const userId = req.user?.userId;

    return this.propertyService.findFiltered(
      page,
      limit,
      { hostOption },
      userId
    );
  }

  // 🔹 Search properties
  @Get("search")
  async searchProperties(@Req() req: any, @Query() query: Record<string, any>) {
    const userId = req.user?.userId;

    const numericFields = [
      "page",
      "limit",
      "minRent",
      "maxRent",
      "minSecurity",
      "maxSecurity",
      "bedrooms",
      "bathrooms",
      "Persons",
    ];
    numericFields.forEach((field) => {
      if (query[field] !== undefined) query[field] = Number(query[field]);
    });

    const arrayFields = ["amenities", "bills", "highlighted", "safety"];
    arrayFields.forEach((field) => {
      if (query[field] && typeof query[field] === "string") {
        query[field] = query[field].split(",").map((v) => v.trim());
      }
    });

    const page = query.page || 1;
    const limit = query.limit || 10;
    const filters = { ...query };
    delete filters.page;
    delete filters.limit;

    return this.propertyService.findFiltered(page, limit, filters, userId);
  }

  // 🔹 My listings
  @Get("my-listings")
  async getMyProperties(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");
    return this.propertyService.findMyProperties(userId);
  }

  // 🔹 Featured properties
  @Get("featured")
  async getFeaturedProperties(@Req() req: any) {
    const userId = req.user?.userId;
    return this.propertyService.getFeaturedProperties(userId);
  }

  // 🔹 Drafts
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
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");
    return this.propertyService.updateProperty(id, dto, userId);
  }

  @Delete(":id")
  async deleteProperty(@Param("id") id: string, @Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");
    return this.propertyService.findPropertyByIdAndDelete(id, userId);
  }
}
