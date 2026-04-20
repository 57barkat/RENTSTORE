import {
  BadRequestException,
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
import { PROPERTY_HOST_OPTIONS } from "./property.constants";
import {
  mapHostelType,
  parseArrayFields,
  parseNumericFields,
} from "./utils/property.utils";
import { validatePropertyPayload } from "./property.validation";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RateLimit } from "../../common/decorators/rate-limit.decorator";
import { GetUser, Public } from "../../common/decorators/public.decorator";

interface PaginationQuery {
  page?: number;
  limit?: number;
}

@UseGuards(JwtAuthGuard)
@Controller("properties")
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post("create")
  // @RateLimit({ limit: 20, windowMs: 60 * 60 * 1000, scope: "user" })
  @UseInterceptors(FileFieldsInterceptor([{ name: "photos", maxCount: 30 }]))
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
    parsedDto.address = parsedAddress;

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
    const rawStatus = dto.status as boolean | string | undefined;
    const publishRequested = rawStatus === true || rawStatus === "true";
    const draftRequested = rawStatus === false || rawStatus === "false";
    const validation = validatePropertyPayload(parsedDto);
    const isComplete =
      requiredFields.every((f) => isFilled(parsedDto[f])) && validation.valid;
    parsedDto.status = publishRequested || isComplete;

    if (draftRequested) {
      parsedDto.status = false;
      return this.propertyService.saveDraft(parsedDto, files?.photos, userId);
    }

    if (publishRequested && !validation.valid) {
      throw new BadRequestException({
        message: "Property submission is incomplete.",
        error: "VALIDATION_FAILED",
        fieldErrors: validation.fieldErrors,
      });
    }

    if (!publishRequested && !isComplete) {
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
  @RateLimit({ limit: 60, windowMs: 60_000, scope: "userOrIp" })
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
    if (!PROPERTY_HOST_OPTIONS.includes(hostOption as any)) {
      throw new BadRequestException(
        `Invalid hostOption. Expected one of: ${PROPERTY_HOST_OPTIONS.join(", ")}`,
      );
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return this.propertyService.findFiltered(
      page,
      limit,
      { hostOption },
      userId,
    );
  }
  @Public()
  @Get("search")
  @RateLimit({ limit: 120, windowMs: 60_000, scope: "userOrIp" })
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

    if (
      query.hostOption &&
      !PROPERTY_HOST_OPTIONS.includes(query.hostOption as any)
    ) {
      throw new BadRequestException(
        `Invalid hostOption. Expected one of: ${PROPERTY_HOST_OPTIONS.join(", ")}`,
      );
    }

    if (query.hostelType) {
      const mapped = mapHostelType(query.hostelType);
      if (!mapped) return { status: 400, message: "Invalid hostelType" };
      query.hostelType = mapped;
    }

    const page = Math.min(Math.max(Number(query.page || 1), 1), 100);
    const limit = Math.min(Math.max(Number(query.limit || 10), 1), 24);

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
    @Query("hostOption") hostOption?: string,
    @Query("status") status?: "active" | "inactive",
    @Query("approvalStatus") approvalStatus?: "approved" | "pending",
    @Query("addressQuery") addressQuery?: string,
    @Query("minRent") minRent?: string,
    @Query("maxRent") maxRent?: string,
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
      {
        hostOption,
        status,
        approvalStatus,
        addressQuery,
        minRent:
          minRent !== undefined && minRent !== ""
            ? Number(minRent)
            : undefined,
        maxRent:
          maxRent !== undefined && maxRent !== ""
            ? Number(maxRent)
            : undefined,
      },
    );
  }

  @Get("address-suggestions")
  @RateLimit({ limit: 60, windowMs: 60_000, scope: "userOrIp" })
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

  @Get(":id/uploader-summary")
  @Public()
  async getUploaderSummary(@Param("id") id: string) {
    return this.propertyService.getPropertyUploaderSummary(id);
  }

  @Get(":id/uploader-profile")
  @Public()
  async getUploaderProfile(@Param("id") id: string) {
    console.log("[PropertyController] uploader-profile request", { id });
    return this.propertyService.getPropertyUploaderProfile(id);
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

  @Patch(":id/visibility")
  async updatePropertyVisibility(
    @Param("id") id: string,
    @Body("status") status: boolean | string,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");

    const nextStatus =
      status === true || status === "true"
        ? true
        : status === false || status === "false"
          ? false
          : null;

    if (nextStatus === null) {
      throw new BadRequestException(
        "A boolean status is required to update property visibility.",
      );
    }

    return this.propertyService.updatePropertyVisibility(id, userId, nextStatus);
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
    @Query("hostOption") hostOption?: string,
  ) {
    if (hostOption && !PROPERTY_HOST_OPTIONS.includes(hostOption as any)) {
      throw new BadRequestException(
        `Invalid hostOption. Expected one of: ${PROPERTY_HOST_OPTIONS.join(", ")}`,
      );
    }
    return this.propertyService.findUnapprovedProperties(
      Number(page),
      Number(limit),
      hostOption,
    );
  }

  @Get("admin/list")
  @SetMetadata("roles", ["admin"])
  async getAdminProperties(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("hostOption") hostOption?: string,
    @Query("q") q?: string,
    @Query("approvalStatus")
    approvalStatus: "all" | "approved" | "pending" = "all",
    @Query("listingStatus")
    listingStatus: "all" | "active" | "inactive" = "all",
  ) {
    if (hostOption && !PROPERTY_HOST_OPTIONS.includes(hostOption as any)) {
      throw new BadRequestException(
        `Invalid hostOption. Expected one of: ${PROPERTY_HOST_OPTIONS.join(", ")}`,
      );
    }

    return this.propertyService.findAdminProperties(Number(page), Number(limit), {
      hostOption,
      q,
      approvalStatus,
      listingStatus,
    });
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
