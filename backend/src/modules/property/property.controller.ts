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

    /** ✅ Address handling */
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

    /** ✅ Correct status calculation */
    const isFilled = (value: any): boolean => {
      if (value === null || value === undefined) return false;

      if (Array.isArray(value)) return value.length > 0;

      if (typeof value === "object") {
        return Object.values(value).some((v) => isFilled(v));
      }

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

    /** ✅ Photo upload */
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
      "Persons",
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
  async deleteProperty(@Param("id") id: string, @Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException("User not authenticated");
    return this.propertyService.findPropertyByIdAndDelete(id, userId);
  }
}
