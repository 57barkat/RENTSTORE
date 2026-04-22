import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PropertyReport } from "./report.schema";
import { Model } from "mongoose";
import { CreateReportDto } from "./dto/create-report.dto";
import { PropertyModerationStatus } from "../property/property.schema";
import { UserAccountStatus } from "../user/user.entity";

@Injectable()
export class ReportsService {
  private static readonly MAX_REPORT_PAGE_SIZE = 50;

  constructor(
    @InjectModel(PropertyReport.name)
    private reportModel: Model<PropertyReport>,
    @InjectModel("Property") private propertyModel: Model<any>,
    @InjectModel("User") private userModel: Model<any>,
  ) {}

  async create(userId: string, dto: CreateReportDto) {
    const existing = await this.reportModel.findOne({
      propertyId: dto.propertyId,
      reporterId: userId,
    });

    if (existing) {
      throw new BadRequestException("You have already reported this property");
    }

    const property = await this.propertyModel.findById(dto.propertyId);
    if (!property) {
      throw new NotFoundException("Property not found");
    }

    const newReport = new this.reportModel({
      ...dto,
      reporterId: userId,
    });

    await newReport.save();

    const reportCount = await this.reportModel.countDocuments({
      propertyId: dto.propertyId,
      status: "PENDING",
    });

    await this.propertyModel.findByIdAndUpdate(dto.propertyId, {
      reportCount,
    });

    if (reportCount >= 3) {
      await this.propertyModel.findByIdAndUpdate(dto.propertyId, {
        moderationStatus: PropertyModerationStatus.UNDER_REVIEW,
        isVisible: false,
      });
    }

    if (reportCount >= 5) {
      await this.propertyModel.findByIdAndUpdate(dto.propertyId, {
        moderationStatus: PropertyModerationStatus.SUSPENDED,
        suspendedAt: new Date(),
        $inc: { strikeCount: 1 },
      });

      const suspendedPropertiesCount = await this.propertyModel.countDocuments({
        ownerId: property.ownerId,
        moderationStatus: PropertyModerationStatus.SUSPENDED,
      });

      if (suspendedPropertiesCount >= 3) {
        await this.userModel.findByIdAndUpdate(property.ownerId, {
          accountStatus: UserAccountStatus.SUSPENDED,
          suspendedAt: new Date(),
          $inc: { strikeCount: 1 },
        });
      }
    }

    return { message: "Report submitted successfully" };
  }

  async getAllReports(page = 1, limit = 20) {
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(
      Math.max(1, Number(limit) || 20),
      ReportsService.MAX_REPORT_PAGE_SIZE,
    );
    const skip = (currentPage - 1) * pageSize;

    const [reports, total] = await Promise.all([
      this.reportModel
        .find()
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate("propertyId")
        .populate("reporterId", "name email phone role")
        .lean()
        .exec(),
      this.reportModel.countDocuments().exec(),
    ]);

    return {
      data: reports,
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateReportStatus(reportId: string, status: string) {
    return this.reportModel.findByIdAndUpdate(
      reportId,
      { status },
      { new: true },
    );
  }

  async approveProperty(propertyId: string) {
    await this.propertyModel.findByIdAndUpdate(propertyId, {
      moderationStatus: PropertyModerationStatus.ACTIVE,
      isVisible: true,
      reportCount: 0,
    });

    await this.reportModel.updateMany({ propertyId }, { status: "REJECTED" });

    return { message: "Property approved successfully" };
  }
  async deleteProperty(propertyId: string) {
    await this.propertyModel.findByIdAndUpdate(propertyId, {
      moderationStatus: PropertyModerationStatus.DELETED,
      deletedAt: new Date(),
      isVisible: false,
    });

    await this.reportModel.updateMany({ propertyId }, { status: "RESOLVED" });

    return { message: "Property deleted successfully" };
  }

  async reactivateUser(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      accountStatus: UserAccountStatus.ACTIVE,
      strikeCount: 0,
    });

    return { message: "User reactivated successfully" };
  }
}
