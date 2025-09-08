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
    console.log("Received property data from frontend:", dto);
    console.log("Received files:", files);
    const userId = req.user.userId;
    const imageFiles = files.images || [];
    const property = await this.propertyService.create(dto, imageFiles, userId);
    console.log("Property created:", property);
    return property;
  }

  @Get()
  async getAll() {
    return this.propertyService.findAll();
  }

  @Get("my-listings")
  async getMyProperties(@Req() req: any) {
    console.log(req.user, req.user.userId, "<<<<<<<<>>>>>>>>>>>>>>>");
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException(
        "User not authenticated not a valid user"
      );
    }
    const result = await this.propertyService.findMyProperties(req.user.userId);
    console.log(result);
    return result;
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
    console.log("dataforupdate", dto);
    return this.propertyService.updateProperty(id, dto, req.user.userId);
  }
  @Delete(":id")
  async deleteProperty(@Param('id') id: string){
  return this.propertyService.findPropertyByIdAndDelete(id)
  }
}
