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
  SetMetadata,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "@nestjs/passport";

import { PropertyService } from "./property.service";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { NearbyPropertyDto } from "./dto/nearby-property.dto";
import {
  mapHostelType,
  parseArrayFields,
  parseNumericFields,
} from "./utils/property.utils";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GetUser, Public } from "src/common/decorators/public.decorator";

interface PaginationQuery {
  page?: number;
  limit?: number;
}

@UseGuards(JwtAuthGuard)
@Controller("properties")
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post("create")
  @UseInterceptors(FileFieldsInterceptor([{ name: "photos", maxCount: 10 }]))
  async createProperty(
    @Body() dto: Partial<CreatePropertyDto>,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
    @Req() req: any,
  ) {
    console.log("Received createProperty request with DTO:", dto);
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");

    const parseJson = (val: any) => {
      if (!val) return undefined;
      try {
        return typeof val === "string" ? JSON.parse(val) : val;
      } catch {
        return val;
      }
    };

    const parsedDto: Partial<CreatePropertyDto> = {
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
    parsedDto.address = parsedAddress[0] || {};

    if (files?.photos?.length) {
      parsedDto.photos = await this.propertyService.uploadFilesToCloudinary(
        files.photos,
      );
    } else if (dto.photos) {
      parsedDto.photos = Array.from(new Set(dto.photos));
    }

    if (parsedDto.lat !== undefined && parsedDto.lng !== undefined) {
      parsedDto.locationGeo = {
        type: "Point",
        coordinates: [parsedDto.lng, parsedDto.lat],
      };
    }

    const isFilled = (value: any): boolean => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value.trim() !== "";
      if (typeof value === "number" || typeof value === "boolean") return true;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object")
        return Object.values(value).some((v) => isFilled(v));
      return false;
    };

    const requiredFields = [
      "hostOption",
      "location",
      "lat",
      "lng",
      "address",
      "safetyDetailsData",
    ];
    const isComplete = requiredFields.every((f) => isFilled(parsedDto[f]));
    parsedDto.status = isComplete;

    if (!isComplete) {
      return this.propertyService.saveDraft(parsedDto, files?.photos, userId);
    }

    return this.propertyService.createOrUpdate(parsedDto, userId);
  }
  @UseGuards(JwtAuthGuard)
  @Post(":id/promote")
  async promoteProperty(
    @Param("id") propertyId: string,
    @Body("type") type: "boost" | "featured",
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return await this.propertyService.promoteListing(propertyId, userId, type);
  }
  @Get()
  @Public()
  async getAll(@Query() query: PaginationQuery) {
    console.log("Fetching all properties with query:", query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return this.propertyService.findAll(page, limit);
  }

  @Get("nearby")
  @Public()
  async getNearbyProperties(
    @Query() query: NearbyPropertyDto,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    const radiusKm = query.radiusKm || 5;
    return this.propertyService.findNearbyProperties(
      query.lat,
      query.lng,
      radiusKm,
      userId,
    );
  }

  @Get("type/:hostOption")
  @Public()
  async getByHostOption(
    @Param("hostOption") hostOption: string,
    @Query() query: PaginationQuery,
    @GetUser("userId") userId?: string,
  ) {
    console.log("Filtering by hostOption:", userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return this.propertyService.findFiltered(
      page,
      limit,
      { hostOption },
      userId,
    );
  }
  @Get("search")
  @Public()
  async searchProperties(@Query() query: Record<string, any>, @Req() req: any) {
    const userId = req.user?.userId;
    parseNumericFields(query, [
      "page",
      "limit",
      "minRent",
      "maxRent",
      "bedrooms",
      "bathrooms",
      "Persons",
      "lat",
      "lng",
      "radiusKm",
    ]);
    parseArrayFields(query, ["amenities", "bills", "mealPlan", "rules"]);

    if (query.hostelType) {
      const mapped = mapHostelType(query.hostelType);
      if (!mapped) return { status: 400, message: "Invalid hostelType" };
      query.hostelType = mapped;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;

    const filters = { ...query };
    delete filters.page;
    delete filters.limit;

    return this.propertyService.findFiltered(page, limit, filters, userId);
  }

  @Get("my-listings")
  async getMyProperties(
    @Req() req: any,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("sort") sort = "newest",
    @Query("search") search?: string,
    @Query("city") city?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");
    return this.propertyService.findMyProperties(
      userId,
      Number(page),
      Number(limit),
      sort,
      search,
      city,
    );
  }

  @Get("address-suggestions")
  @Public()
  async getAddressSuggestions(@Query("q") q: string) {
    return this.propertyService.getAddressSuggestions(q);
  }
  @Get("dashboard-stats")
  @UseGuards(JwtAuthGuard)
  async getDashboardStats(
    @Req() req: any,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
  ) {
    const userId = req.user.userId;
    return this.propertyService.getOwnerDashboard(userId, page, limit);
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
  @Public()
  async findById(@Param("id") id: string, @Req() req: any) {
    const userId = req.user?.userId;
    return this.propertyService.findPropertyById(id, userId);
  }

  @Patch(":id")
  async updateProperty(
    @Param("id") id: string,
    @Body() dto: Partial<CreatePropertyDto>,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");
    return this.propertyService.updateProperty(id, dto, userId);
  }
  @Post(":id/view")
  @Public()
  async incrementViews(@Param("id") id: string) {
    return await this.propertyService.incrementViews(id);
  }

  @Delete(":id")
  async deleteProperty(@Param("id") id: string, @Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");
    return this.propertyService.findPropertyByIdAndDelete(id, userId);
  }

  @Get("admin/unapproved")
  @SetMetadata("roles", ["admin"])
  async getUnapproved(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.propertyService.findUnapprovedProperties(
      Number(page),
      Number(limit),
    );
  }

  @Patch("admin/approve/:id")
  @SetMetadata("roles", ["admin"])
  async approve(@Param("id") id: string) {
    return this.propertyService.approveProperty(id);
  }

  @Delete("admin/delete/:id")
  @SetMetadata("roles", ["admin"])
  async adminDelete(@Param("id") id: string, @Req() req: any) {
    return this.propertyService.adminDeleteProperty(id, req.user.userId);
  }

  @Get("admin/view/:id")
  @SetMetadata("roles", ["admin"])
  async adminViewProperty(@Param("id") id: string, @Req() req: any) {
    const userId = req.user?.userId;
    return this.propertyService.findPropertyById(id, userId);
  }
}
