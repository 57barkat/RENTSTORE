import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";

import { CreateReportDto } from "./dto/create-report.dto";
import { UpdateReportStatusDto } from "./dto/update-report-status.dto";
import {
  PropertyReport,
  ReportReason,
  ReportStatus,
} from "./report.schema";
import {
  Property,
  PropertyModerationStatus,
} from "../property/property.schema";
import {
  User,
  UserAccountStatus,
  UserDocument,
} from "../user/user.entity";

type LegacyReportStatus = "PENDING" | "RESOLVED" | "REJECTED";

type PopulatedUserSummary = {
  _id?: Types.ObjectId | string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

type PopulatedPropertySummary = {
  _id?: Types.ObjectId | string;
  title?: string;
  ownerId?: Types.ObjectId | string | PopulatedUserSummary;
  status?: boolean;
  isVisible?: boolean;
  moderationStatus?: string;
};

type LeanReport = {
  _id: Types.ObjectId | string;
  propertyId?: Types.ObjectId | string | PopulatedPropertySummary | null;
  reporterUserId?: Types.ObjectId | string | PopulatedUserSummary | null;
  reporterId?: Types.ObjectId | string | PopulatedUserSummary | null;
  listingOwnerId?: Types.ObjectId | string | PopulatedUserSummary | null;
  reportReason?: string;
  reason?: string;
  details?: string;
  description?: string;
  status?: string;
  adminNotes?: string;
  actionTaken?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  reviewedAt?: Date | string;
  reviewedByAdminId?: Types.ObjectId | string | PopulatedUserSummary | null;
};

const DUPLICATE_REPORT_WINDOW_MS = 15 * 60 * 1000;
const REPORT_UNDO_WINDOW_MS = 30 * 1000;

const LEGACY_REASON_MAP: Record<string, ReportReason> = {
  SCAM: ReportReason.SUSPICIOUS_OWNER_AGENT,
  RENTED: ReportReason.UNAVAILABLE,
  SOLD: ReportReason.UNAVAILABLE,
  INCORRECT_DATA: ReportReason.WRONG_LOCATION,
  MISLEADING_PHOTOS: ReportReason.MISLEADING_PHOTOS,
  OTHER: ReportReason.OTHER,
};

const READABLE_REASON_MAP: Record<string, ReportReason> = {
  fake_property: ReportReason.FAKE_PROPERTY,
  wrong_price: ReportReason.WRONG_PRICE,
  wrong_location: ReportReason.WRONG_LOCATION,
  already_rented_unavailable: ReportReason.UNAVAILABLE,
  already_rented_or_unavailable: ReportReason.UNAVAILABLE,
  duplicate_listing: ReportReason.DUPLICATE_LISTING,
  misleading_photos: ReportReason.MISLEADING_PHOTOS,
  suspicious_owner_agent: ReportReason.SUSPICIOUS_OWNER_AGENT,
  offensive_or_illegal_content: ReportReason.OFFENSIVE_OR_ILLEGAL,
  other: ReportReason.OTHER,
};

@Injectable()
export class ReportsService {
  private static readonly MAX_REPORT_PAGE_SIZE = 50;

  constructor(
    @InjectModel(PropertyReport.name)
    private reportModel: Model<PropertyReport>,
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private toObjectId(value: string, label: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ${label}`);
    }

    return new Types.ObjectId(value);
  }

  private sanitizeOptionalText(value?: string) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private resolvePropertyId(dto: CreateReportDto) {
    const propertyId = dto.propertyId || dto.listingId;

    if (!propertyId) {
      throw new BadRequestException("Listing/property ID is required");
    }

    return this.toObjectId(propertyId, "property id");
  }

  private normalizeReason(value?: string): ReportReason | null {
    const raw = value?.trim();

    if (!raw) {
      return null;
    }

    if (Object.values(ReportReason).includes(raw as ReportReason)) {
      return raw as ReportReason;
    }

    const legacyReason = LEGACY_REASON_MAP[raw.toUpperCase()];
    if (legacyReason) {
      return legacyReason;
    }

    const normalized = raw
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/\s*\/\s*/g, "_")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    return READABLE_REASON_MAP[normalized] || null;
  }

  private normalizeStatus(value?: string): ReportStatus | null {
    if (!value) {
      return null;
    }

    if (Object.values(ReportStatus).includes(value as ReportStatus)) {
      return value as ReportStatus;
    }

    if (value === "PENDING") {
      return ReportStatus.PENDING;
    }

    if (value === "RESOLVED") {
      return ReportStatus.REVIEWED;
    }

    if (value === "REJECTED") {
      return ReportStatus.DISMISSED;
    }

    return null;
  }

  private getStatusFilterValues(status?: string) {
    const normalized = this.normalizeStatus(status);

    if (!normalized) {
      return undefined;
    }

    const legacyValues: Record<ReportStatus, LegacyReportStatus[]> = {
      [ReportStatus.PENDING]: ["PENDING"],
      [ReportStatus.REVIEWED]: ["RESOLVED"],
      [ReportStatus.DISMISSED]: ["REJECTED"],
      [ReportStatus.REMOVED]: [],
    };

    return [normalized, ...legacyValues[normalized]];
  }

  private getIdString(
    value?: Types.ObjectId | string | PopulatedUserSummary | PopulatedPropertySummary | null,
  ) {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (value instanceof Types.ObjectId) {
      return value.toString();
    }

    return value._id ? String(value._id) : "";
  }

  private normalizeReport(report: LeanReport) {
    const property =
      report.propertyId &&
      typeof report.propertyId === "object" &&
      !(report.propertyId instanceof Types.ObjectId)
        ? report.propertyId
        : null;
    const ownerFromProperty =
      property?.ownerId &&
      typeof property.ownerId === "object" &&
      !(property.ownerId instanceof Types.ObjectId)
        ? property.ownerId
        : null;
    const reportReason =
      this.normalizeReason(report.reportReason || report.reason) ||
      ReportReason.OTHER;

    return {
      ...report,
      id: this.getIdString(report._id),
      listingId: this.getIdString(report.propertyId),
      propertyId: report.propertyId,
      reportReason,
      reason: reportReason,
      details: report.details || report.description || "",
      description: report.details || report.description || "",
      reporterUserId: report.reporterUserId || report.reporterId || null,
      reporterId: report.reporterUserId || report.reporterId || null,
      listingOwnerId: report.listingOwnerId || ownerFromProperty || null,
      status: this.normalizeStatus(report.status) || ReportStatus.PENDING,
      adminNotes: report.adminNotes || "",
      actionTaken: report.actionTaken || "",
    };
  }

  async create(userId: string, dto: CreateReportDto) {
    const reporterUserId = this.toObjectId(userId, "user id");
    const propertyId = this.resolvePropertyId(dto);
    const reportReason = this.normalizeReason(dto.reportReason || dto.reason);
    const undoExpiresAt = new Date(Date.now() + REPORT_UNDO_WINDOW_MS);

    if (!reportReason) {
      throw new BadRequestException("Report reason is required");
    }

    const property = await this.propertyModel
      .findById(propertyId)
      .select("_id ownerId")
      .lean()
      .exec();

    if (!property) {
      throw new NotFoundException("Property not found");
    }

    const listingOwnerId = this.toObjectId(
      String(property.ownerId),
      "listing owner id",
    );
    const recentDuplicateCutoff = new Date(
      Date.now() - DUPLICATE_REPORT_WINDOW_MS,
    );
    const existing = await this.reportModel.findOne({
      propertyId,
      createdAt: { $gte: recentDuplicateCutoff },
      $or: [{ reporterUserId }, { reporterId: reporterUserId }],
    });

    if (existing) {
      throw new BadRequestException(
        "You have already reported this listing recently",
      );
    }

    const details = this.sanitizeOptionalText(dto.details || dto.description);
    const newReport = new this.reportModel({
      propertyId,
      reporterUserId,
      reporterId: reporterUserId,
      listingOwnerId,
      reportReason,
      reason: reportReason,
      details,
      description: details,
      status: ReportStatus.PENDING,
      undoExpiresAt,
    });

    await newReport.save();

    const reportCount = await this.reportModel.countDocuments({
      propertyId,
      status: { $in: [ReportStatus.PENDING, "PENDING"] },
    });

    await this.propertyModel.findByIdAndUpdate(propertyId, {
      reportCount,
    });

    return {
      message:
        "Thanks. Our team will review this listing. If it violates AnganStay rules, we may remove it or contact the owner.",
      reportId: newReport._id,
      propertyId,
      undoExpiresAt,
      undoWindowSeconds: Math.round(REPORT_UNDO_WINDOW_MS / 1000),
    };
  }

  async getHiddenPropertyIdsForUser(userId: string) {
    const reporterUserId = this.toObjectId(userId, "user id");
    const reports = await this.reportModel
      .find({
        $or: [{ reporterUserId }, { reporterId: reporterUserId }],
      })
      .select("propertyId")
      .lean()
      .exec();

    return {
      propertyIds: Array.from(
        new Set(
          reports
            .map((report) => this.getIdString(report.propertyId))
            .filter(Boolean),
        ),
      ),
    };
  }

  async undoReport(userId: string, reportId: string) {
    const reporterUserId = this.toObjectId(userId, "user id");
    const reportObjectId = this.toObjectId(reportId, "report id");
    const report = await this.reportModel
      .findOne({
        _id: reportObjectId,
        $or: [{ reporterUserId }, { reporterId: reporterUserId }],
      })
      .lean()
      .exec();

    if (!report) {
      throw new NotFoundException("Report not found");
    }

    if (
      report.undoExpiresAt &&
      new Date(report.undoExpiresAt).getTime() < Date.now()
    ) {
      throw new BadRequestException("The undo window for this report has expired");
    }

    await this.reportModel.deleteOne({ _id: reportObjectId });

    const propertyId = report.propertyId as Types.ObjectId;
    const reportCount = await this.reportModel.countDocuments({
      propertyId,
      status: { $in: [ReportStatus.PENDING, "PENDING"] },
    });

    await this.propertyModel.findByIdAndUpdate(propertyId, { reportCount });

    return {
      message: "Report undone",
      propertyId,
      reportId,
    };
  }

  async getAllReports(page = 1, limit = 20, status?: string) {
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(
      Math.max(1, Number(limit) || 20),
      ReportsService.MAX_REPORT_PAGE_SIZE,
    );
    const skip = (currentPage - 1) * pageSize;
    const statusValues = this.getStatusFilterValues(status);
    const filter: FilterQuery<PropertyReport> = statusValues
      ? { status: { $in: statusValues } }
      : {};

    const [reports, total] = await Promise.all([
      this.reportModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate("propertyId", "title ownerId status isVisible moderationStatus")
        .populate("reporterUserId", "name email phone role")
        .populate("reporterId", "name email phone role")
        .populate("listingOwnerId", "name email phone role accountStatus isBlocked")
        .populate("reviewedByAdminId", "name email role")
        .lean()
        .exec() as unknown as Promise<LeanReport[]>,
      this.reportModel.countDocuments(filter).exec(),
    ]);

    return {
      data: reports.map((report) => this.normalizeReport(report)),
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateReportStatus(
    reportId: string,
    dto: UpdateReportStatusDto,
    adminUserId?: string,
  ) {
    const normalizedStatus = this.normalizeStatus(dto.status);
    const update: Record<string, unknown> = {};

    if (dto.status && !normalizedStatus) {
      throw new BadRequestException("Invalid report status");
    }

    if (normalizedStatus) {
      update.status = normalizedStatus;

      if (normalizedStatus !== ReportStatus.PENDING) {
        update.reviewedAt = new Date();
        if (adminUserId) {
          update.reviewedByAdminId = this.toObjectId(adminUserId, "admin id");
        }
      }
    }

    if (dto.adminNotes !== undefined) {
      update.adminNotes = this.sanitizeOptionalText(dto.adminNotes) || "";
    }

    if (dto.actionTaken !== undefined) {
      update.actionTaken = this.sanitizeOptionalText(dto.actionTaken) || "";
    }

    if (Object.keys(update).length === 0) {
      throw new BadRequestException("No report updates were provided");
    }

    const report = await this.reportModel
      .findByIdAndUpdate(reportId, { $set: update }, { new: true })
      .populate("propertyId", "title ownerId status isVisible moderationStatus")
      .populate("reporterUserId", "name email phone role")
      .populate("reporterId", "name email phone role")
      .populate("listingOwnerId", "name email phone role accountStatus isBlocked")
      .populate("reviewedByAdminId", "name email role")
      .lean()
      .exec();

    if (!report) {
      throw new NotFoundException("Report not found");
    }

    return this.normalizeReport(report as unknown as LeanReport);
  }

  async approveProperty(propertyId: string, adminUserId?: string) {
    const propertyObjectId = this.toObjectId(propertyId, "property id");

    const property = await this.propertyModel.findByIdAndUpdate(propertyObjectId, {
      moderationStatus: PropertyModerationStatus.ACTIVE,
      isVisible: true,
      reportCount: 0,
    });

    if (!property) {
      throw new NotFoundException("Property not found");
    }

    await this.reportModel.updateMany(
      { propertyId: propertyObjectId },
      {
        status: ReportStatus.DISMISSED,
        actionTaken: "listing_kept_active",
        reviewedAt: new Date(),
        ...(adminUserId
          ? { reviewedByAdminId: this.toObjectId(adminUserId, "admin id") }
          : {}),
      },
    );

    return { message: "Property approved successfully" };
  }

  async deleteProperty(propertyId: string, adminUserId?: string) {
    const propertyObjectId = this.toObjectId(propertyId, "property id");

    const property = await this.propertyModel.findByIdAndUpdate(propertyObjectId, {
      moderationStatus: PropertyModerationStatus.DELETED,
      deletedAt: new Date(),
      isVisible: false,
      status: false,
    });

    if (!property) {
      throw new NotFoundException("Property not found");
    }

    await this.reportModel.updateMany(
      { propertyId: propertyObjectId },
      {
        status: ReportStatus.REMOVED,
        actionTaken: "listing_hidden",
        reviewedAt: new Date(),
        ...(adminUserId
          ? { reviewedByAdminId: this.toObjectId(adminUserId, "admin id") }
          : {}),
      },
    );

    return { message: "Property hidden successfully" };
  }

  async removeListingForReport(
    reportId: string,
    adminUserId: string,
    dto: UpdateReportStatusDto = {},
  ) {
    const report = await this.reportModel.findById(reportId).lean().exec();

    if (!report) {
      throw new NotFoundException("Report not found");
    }

    await this.deleteProperty(String(report.propertyId), adminUserId);

    return this.updateReportStatus(
      reportId,
      {
        ...dto,
        status: ReportStatus.REMOVED,
        actionTaken: dto.actionTaken || "listing_hidden",
      },
      adminUserId,
    );
  }

  async suspendOwnerForReport(
    reportId: string,
    adminUserId: string,
    dto: UpdateReportStatusDto = {},
  ) {
    const report = await this.reportModel
      .findById(reportId)
      .populate("propertyId", "ownerId")
      .lean()
      .exec();

    if (!report) {
      throw new NotFoundException("Report not found");
    }

    const leanReport = report as unknown as LeanReport;
    const property =
      leanReport.propertyId &&
      typeof leanReport.propertyId === "object" &&
      !(leanReport.propertyId instanceof Types.ObjectId)
        ? leanReport.propertyId
        : null;
    const ownerId =
      this.getIdString(leanReport.listingOwnerId) ||
      this.getIdString(property?.ownerId);

    if (!ownerId) {
      throw new NotFoundException("Listing owner not found");
    }

    await this.userModel.findByIdAndUpdate(ownerId, {
      accountStatus: UserAccountStatus.SUSPENDED,
      isBlocked: true,
      suspendedAt: new Date(),
      suspensionReason:
        this.sanitizeOptionalText(dto.adminNotes) ||
        "Suspended after listing report review.",
      $inc: { strikeCount: 1 },
    });

    return this.updateReportStatus(
      reportId,
      {
        ...dto,
        status: ReportStatus.REVIEWED,
        actionTaken: dto.actionTaken || "owner_suspended",
      },
      adminUserId,
    );
  }

  async reactivateUser(userId: string) {
    const userObjectId = this.toObjectId(userId, "user id");

    await this.userModel.findByIdAndUpdate(userObjectId, {
      accountStatus: UserAccountStatus.ACTIVE,
      isBlocked: false,
      strikeCount: 0,
      suspendedAt: null,
      suspensionReason: "",
    });

    return { message: "User reactivated successfully" };
  }
}
