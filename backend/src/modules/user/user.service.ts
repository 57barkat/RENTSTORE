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
import { EmailService } from "src/services/email/email.service";
import { Agency, AgencyDocument } from "../Agency/agency.entity";
import { UpdateUserDto } from "./dto/user-update.dto";

@Injectable()
export class UserService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Agency.name) private agencyModel: Model<AgencyDocument>,
    private readonly emailService: EmailService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserDocument> {
    const conflict = await this.userModel.findOne({
      $or: [{ email: dto.email }, { phone: dto.phone }, { cnic: dto.cnic }],
    });

    if (conflict) {
      if (conflict.email === dto.email)
        throw new BadRequestException("EMAIL_EXISTS");
      if (conflict.phone === dto.phone)
        throw new BadRequestException("PHONE_EXISTS");
      if (conflict.cnic === dto.cnic)
        throw new BadRequestException("CNIC_EXISTS");
    }

    const password = await bcrypt.hash(dto.password, 10);

    const role = dto.role;

    let propertyLimit = 0;

    switch (role) {
      case UserRole.USER:
        propertyLimit = 2;
        break;
      case UserRole.AGENT:
        propertyLimit = 5;
        break;
      case UserRole.AGENCY:
        propertyLimit = 50;
        break;
    }

    const user = await this.userModel.create({
      ...dto,
      password,
      role,
      propertyLimit,
      isEmailVerified: false,
      isPhoneVerified: false,
      TermsAndConditionsAccepted: dto.acceptedTerms,
    });

    if (role === UserRole.AGENCY && dto.agencyName) {
      const agency = await this.agencyModel.create({
        name: dto.agencyName,
        logo: dto.agencyLogo,
        address: dto.agencyAddress,
        owner: user._id,
        agents: [],
      });

      user.agency = agency._id as any;
      user.propertyLimit = 50;
      await user.save();
    }

    await this.sendEmailVerificationCode(user.email);

    return user;
  }

  async sendEmailVerificationCode(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.userModel.updateOne(
      { email },
      {
        emailVerificationCode: code,
        emailVerificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    );
    this.emailService.sendVerificationEmail(email, code);
  }

  async verifyEmail(email: string, code: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });

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
      const fbUser = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(fbUser.uid, { emailVerified: true });
    } catch {}

    return user;
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

    let user = await this.userModel.findOne({ email: payload.email });

    if (!user) {
      user = await this.userModel.create({
        name: payload.name,
        email: payload.email,
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

  async validatePassword(emailOrPhone: string, password: string) {
    const user = await this.userModel.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

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
    const skip = (page - 1) * limit;

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
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(query),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateUserDto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return updatedUser;
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
