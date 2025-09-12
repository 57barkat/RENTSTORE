import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  private async cleanupUnverifiedUsers() {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);

    await this.userModel.deleteMany({
      isPhoneVerified: false,
      createdAt: { $lt: fiveHoursAgo },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User | string> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    await this.cleanupUnverifiedUsers();

    const conflict = await this.userModel.findOne({
      $or: [
        { email: createUserDto.email },
        { phone: createUserDto.phone },
        { cnic: createUserDto.cnic },
        ...(createUserDto.agencyName
          ? [{ agencyName: createUserDto.agencyName }]
          : []),
      ],
    });

    if (conflict) {
      if (conflict.email === createUserDto.email) return "EMAIL_EXISTS";
      if (conflict.phone === createUserDto.phone) return "PHONE_EXISTS";
      if (conflict.cnic === createUserDto.cnic) return "CNIC_EXISTS";
      if (conflict.agencyName === createUserDto.agencyName)
        return "AGENCY_EXISTS";
    }

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      isPhoneVerified: false,
    });
    return createdUser.save();
  }
  async validateUser(
    emailOrPhone: string,
    password: string
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );
  }

  async updateSubscriptions(
    userId: string,
    categories: string[]
  ): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { subscriptions: categories },
      { new: true }
    );
  }
  async findByIdAndDelete(userId: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(userId).exec();
  }
}
