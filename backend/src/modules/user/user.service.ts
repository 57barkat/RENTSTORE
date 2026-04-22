import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument, UserRole } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import * as admin from "firebase-admin";
import { UpdateUserDto } from "./dto/user-update.dto";
import { Property } from "../property/property.schema";
import { ResetPasswordDto } from "./dto/forgot-password.dto";
import { Agency, AgencyDocument } from "../Agency/agency.entity";
import { EmailService } from "../../services/email/email.service";

@Injectable()
export class UserService {
  private static readonly MAX_ADMIN_PAGE_SIZE = 50;
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Agency.name) private agencyModel: Model<AgencyDocument>,
    @InjectModel(Property.name)
    private propertyModel: Model<Property>,
    private readonly emailService: EmailService,
  ) {}

  private normalizeEmail(email?: string | null): string {
    return (email || "").trim().toLowerCase();
  }

  private buildEmailLookup(email?: string | null) {
    const normalizedEmail = this.normalizeEmail(email);

    return {
      normalizedEmail,
      emailQuery: normalizedEmail
        ? { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }
        : normalizedEmail,
    };
  }

  async createUser(dto: CreateUserDto): Promise<UserDocument> {
    const normalizedEmail = this.normalizeEmail(dto.email);

    // 1. Check for existing users
    const conflict = await this.userModel.findOne({
      $or: [
        { email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } },
        { phone: dto.phone },
        { cnic: dto.cnic },
      ],
    });

    if (conflict) {
      if (this.normalizeEmail(conflict.email) === normalizedEmail)
        throw new BadRequestException("EMAIL_EXISTS");
      if (conflict.phone === dto.phone)
        throw new BadRequestException("PHONE_EXISTS");
      if (conflict.cnic === dto.cnic)
        throw new BadRequestException("CNIC_EXISTS");
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Determine property limit based on role
    const role = dto.role || UserRole.USER;
    let propertyLimit = 1;

    switch (role) {
      case UserRole.USER:
        propertyLimit = 1;
        break;
      case UserRole.AGENT:
        propertyLimit = 3;
        break;
      case UserRole.AGENCY:
        propertyLimit = 50;
        break;
    }

    // 4. Extract fields to avoid saving "confirmPassword" or DTO-only fields
    // This prevents the "property should not exist" issue if you decide to send it
    const {
      acceptedTerms,
      isAgencyPerson,
      agencyName,
      agencyLogo,
      agencyAddress,
      ...cleanedData
    } = dto;

    const user = await this.userModel.create({
      ...cleanedData,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      propertyLimit,
      isEmailVerified: false,
      isPhoneVerified: false,
      TermsAndConditionsAccepted: acceptedTerms,
    });

    // 5. Handle Agency Creation if applicable
    if (role === UserRole.AGENCY && agencyName) {
      const agency = await this.agencyModel.create({
        name: agencyName,
        logo: agencyLogo,
        address: agencyAddress,
        owner: user._id,
        agents: [],
      });

      user.agency = agency._id as any;
      // user.propertyLimit = 50; // Already set in the switch above
      await user.save();
    }

    // 6. Send verification
    await this.sendEmailVerificationCode(user.email);

    return user;
  }

  async sendEmailVerificationCode(email: string) {
    const { normalizedEmail, emailQuery } = this.buildEmailLookup(email);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.userModel.updateOne(
      { email: emailQuery },
      {
        emailVerificationCode: code,
        emailVerificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    );
    this.emailService.sendVerificationEmail(normalizedEmail, code);
  }

  async handleSuccessfulPayment(userId: string, packageId: string) {
    const packages = {
      standard: {
        p: 10,
        f: 0,
        limitInc: 10,
        priorityInc: 2,
        sub: "standard",
      },
      pro: {
        p: 40,
        f: 0,
        limitInc: 40,
        priorityInc: 8,
        sub: "pro",
      },
      featured_boost: {
        p: 0,
        f: 1,
        limitInc: 0,
        priorityInc: 0,
        sub: null,
      },
    };
    const config = packages[packageId];
    if (!config) throw new Error("Invalid Package");

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const update: any = {
      $inc: {
        paidPropertyCredits: config.p,
        paidFeaturedCredits: config.f,
        propertyLimit: config.limitInc,
        prioritySlotCredits: config.priorityInc,
      },
    };
    if (config.sub) {
      update.$set = {
        subscription: config.sub,
        subscriptionStartDate: startDate.toISOString(),
        subscriptionEndDate: endDate.toISOString(),
        subscriptionAutoRenew: false,
      };
    }

    return await this.userModel.findByIdAndUpdate(userId, update, {
      new: true,
    });
  }

  async verifyEmail(email: string, code: string): Promise<UserDocument> {
    const { normalizedEmail, emailQuery } = this.buildEmailLookup(email);
    const user = await this.userModel.findOne({ email: emailQuery });

    if (!user) throw new BadRequestException("User not found");
    if (user.isEmailVerified)
      throw new BadRequestException("Email already verified");
    if (user.emailVerificationCode !== code)
      throw new BadRequestException("Invalid code");
    if (
      !user.emailVerificationCodeExpires ||
      user.emailVerificationCodeExpires < new Date()
    )
      throw new BadRequestException("Code expired");

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    await user.save();

    try {
      const fbUser = await admin.auth().getUserByEmail(normalizedEmail);
      await admin.auth().updateUser(fbUser.uid, { emailVerified: true });
    } catch {}

    return user;
  }

  async requestPasswordReset(email: string) {
    const { normalizedEmail, emailQuery } = this.buildEmailLookup(email);
    const user = await this.userModel.findOne({ email: emailQuery });
    if (!user)
      return {
        message: "If your email is registered, you will receive a code.",
      };

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordCode = code;
    user.resetPasswordCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.isResetCodeVerified = false;
    await user.save();

    await this.emailService.sendVerificationEmail(normalizedEmail, code);

    return { message: "Reset code sent successfully" };
  }

  async verifyResetCode(email: string, code: string) {
    const { emailQuery } = this.buildEmailLookup(email);
    const user = await this.userModel.findOne({
      email: emailQuery,
      resetPasswordCode: code,
      resetPasswordCodeExpires: { $gt: new Date() },
    });

    if (!user) throw new BadRequestException("INVALID_OR_EXPIRED_CODE");

    user.isResetCodeVerified = true;
    await user.save();

    return { message: "Code verified. You may now reset your password." };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { emailQuery } = this.buildEmailLookup(dto.email);
    const user = await this.userModel.findOne({
      email: emailQuery,
      isResetCodeVerified: true,
    });

    if (!user) throw new UnauthorizedException("VERIFICATION_REQUIRED");

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpires = undefined;
    user.isResetCodeVerified = false; // Lock it back up
    await user.save();

    return { message: "Password reset successful" };
  }

  async updateUserCredits(
    userId: string,
    updateDto: { paidPropertyCredits?: number; paidFeaturedCredits?: number },
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    // 1. Update Standard Property Credits only if provided in payload
    if (updateDto.paidPropertyCredits !== undefined) {
      const currentProps = Number(user.paidPropertyCredits) || 0;
      user.paidPropertyCredits =
        currentProps + Number(updateDto.paidPropertyCredits);
    }

    // 2. Update Featured Credits only if provided in payload
    if (updateDto.paidFeaturedCredits !== undefined) {
      const currentFeatured = Number(user.paidFeaturedCredits) || 0;
      user.paidFeaturedCredits =
        currentFeatured + Number(updateDto.paidFeaturedCredits);
    }

    const updatedUser = await user.save();

    return {
      message: "Credits updated successfully",
      updatedUser,
    };
  }
  /* -------------------------------------------------------------------------- */
  /*                               GOOGLE LOGIN                                  */
  /* -------------------------------------------------------------------------- */

  async googleLogin(idToken: string): Promise<UserDocument> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) throw new UnauthorizedException();

    const normalizedEmail = this.normalizeEmail(payload.email);
    let user = await this.userModel.findOne({
      email: {
        $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });

    if (!user) {
      user = await this.userModel.create({
        name: payload.name,
        email: normalizedEmail,
        password: await bcrypt.hash(Math.random().toString(), 10),
        isEmailVerified: true,
        isPhoneVerified: true,
        profileImage: payload.picture,
        role: UserRole.USER,
        phone: `GOOGLE_${Date.now()}`,
        cnic: `GOOGLE_${Date.now()}`,
        TermsAndConditionsAccepted: true,
      });
    }

    return user;
  }

  /* -------------------------------------------------------------------------- */
  /*                               AUTH HELPERS                                  */
  /* -------------------------------------------------------------------------- */
  async getPropertyUploadStatus(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    let propertyCount = 0;

    if (user.agency) {
      const agencyUsers = await this.userModel.find({
        agency: user.agency,
      });

      const agencyUserIds = agencyUsers.map((u) => u._id);

      propertyCount = await this.propertyModel.countDocuments({
        ownerId: { $in: agencyUserIds },
      });
    } else {
      propertyCount = await this.propertyModel.countDocuments({
        ownerId: userId,
      });
    }

    const remainingFree = Math.max(user.propertyLimit - propertyCount, 0);

    const canUpload = remainingFree > 0 || user.paidPropertyCredits > 0;

    return {
      limit: user.propertyLimit,
      used: propertyCount,
      remainingFree,
      paidCredits: user.paidPropertyCredits,
      canUpload,
    };
  }
  async validatePassword(emailOrPhone: string, password: string) {
    const trimmedIdentifier = emailOrPhone.trim();
    const isEmailLogin = trimmedIdentifier.includes("@");
    const normalizedEmail = this.normalizeEmail(trimmedIdentifier);

    const user = await this.userModel.findOne(
      isEmailLogin
        ? {
            email: {
              $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              $options: "i",
            },
          }
        : { phone: trimmedIdentifier },
    );

    if (!user || !user.password) return null;
    if (!(await bcrypt.compare(password, user.password))) return null;

    return user;
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }
  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone }).exec();
  }
  async update(id: string, data: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  async findAll() {
    return this.userModel.find();
  }
  async findAllPaginated(page: number, limit: number, search: string) {
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(
      Math.max(1, Number(limit) || 10),
      UserService.MAX_ADMIN_PAGE_SIZE,
    );
    const skip = (currentPage - 1) * pageSize;

    // Create a search filter if search string exists
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .exec(),
      this.userModel.countDocuments(query),
    ]);

    return {
      data: users,
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
  async clearRefreshToken(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1 },
    });
  }
  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const updatePayload = await this.prepareAdminUserUpdate(updateUserDto);

    if (Object.keys(updatePayload).length === 0) {
      const existingUser = await this.userModel.findById(userId).exec();
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      return existingUser;
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        updatePayload,
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return updatedUser;
  }

  private async prepareAdminUserUpdate(updateUserDto: UpdateUserDto) {
    const dateFields = new Set([
      "resetPasswordCodeExpires",
      "subscriptionStartDate",
      "subscriptionEndDate",
      "emailVerificationCodeExpires",
      "suspendedAt",
      "bannedAt",
    ]);
    const arrayFields = new Set(["subscriptions", "favorites"]);
    const unsettableFields = new Set([
      "resetPasswordCode",
      "agency",
      "agencyLicense",
      "preferences",
      "fcmToken",
      "refreshToken",
      "profileImage",
      "emailVerificationCode",
      "suspensionReason",
    ]);

    const updateQuery: Record<string, Record<string, any>> = {
      $set: {},
      $unset: {},
    };

    for (const [key, rawValue] of Object.entries(updateUserDto)) {
      if (rawValue === undefined) {
        continue;
      }

      if (key === "password") {
        const password = String(rawValue).trim();
        if (password) {
          updateQuery.$set.password = await bcrypt.hash(password, 10);
        }
        continue;
      }

      if (dateFields.has(key)) {
        if (!rawValue) {
          updateQuery.$unset[key] = 1;
          continue;
        }

        const parsedDate = new Date(String(rawValue));
        if (Number.isNaN(parsedDate.getTime())) {
          throw new BadRequestException(`Invalid date supplied for ${key}`);
        }

        updateQuery.$set[key] = parsedDate;
        continue;
      }

      if (arrayFields.has(key)) {
        updateQuery.$set[key] = Array.isArray(rawValue) ? rawValue : [];
        continue;
      }

      if (unsettableFields.has(key)) {
        const normalized =
          typeof rawValue === "string" ? rawValue.trim() : rawValue;

        if (
          normalized === "" ||
          normalized === null ||
          normalized === undefined
        ) {
          updateQuery.$unset[key] = 1;
        } else {
          updateQuery.$set[key] = rawValue;
        }
        continue;
      }

      updateQuery.$set[key] = rawValue;
    }

    if (Object.keys(updateQuery.$set).length === 0) {
      delete updateQuery.$set;
    }

    if (Object.keys(updateQuery.$unset).length === 0) {
      delete updateQuery.$unset;
    }

    return Object.keys(updateQuery).length > 0 ? updateQuery : {};
  }

  async deleteUser(userId: string) {
    // Optional: Check if user exists first or has active properties
    const result = await this.userModel.findByIdAndDelete(userId).exec();

    if (!result) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return { message: "User deleted successfully", id: userId };
  }
}
