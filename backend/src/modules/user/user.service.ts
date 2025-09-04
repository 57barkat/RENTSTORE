import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User | string> {
    const conflict = await this.userModel.findOne({
      $or: [
        { email: createUserDto.email },
        { phone: createUserDto.phone },
        { cnic: createUserDto.cnic },
        ...(createUserDto.agencyName ? [{ agencyName: createUserDto.agencyName }] : []),
      ],
    });

    if (conflict) {
      if (conflict.email === createUserDto.email) return 'EMAIL_EXISTS';
      if (conflict.phone === createUserDto.phone) return 'PHONE_EXISTS';
      if (conflict.cnic === createUserDto.cnic) return 'CNIC_EXISTS';
      if (conflict.agencyName === createUserDto.agencyName) return 'AGENCY_EXISTS';
    }

    const createdUser = new this.userModel({
      ...createUserDto,
      isPhoneVerified: false,
    });
    return createdUser.save();
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

  async updateSubscriptions(userId: string, categories: string[]): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { subscriptions: categories },
      { new: true }
    );
  }
}
