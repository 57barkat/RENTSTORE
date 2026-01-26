import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument, UserRole } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import * as admin from "firebase-admin";
import { MailerService } from "@nestjs-modules/mailer";
import * as serviceAccount from "../../services/firebase-service.json";

@Injectable()
export class UserService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailerService: MailerService,
  ) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
      });
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                SIGNUP FLOW                                 */
  /* -------------------------------------------------------------------------- */

  async createUser(dto: CreateUserDto): Promise<UserDocument> {
    await this.cleanupUnverifiedUsers();

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

    const user = await this.userModel.create({
      ...dto,
      password,
      role: UserRole.USER,
      isEmailVerified: false,
      isPhoneVerified: false,
      TermsAndConditionsAccepted: dto.acceptedTerms,
    });

    await this.sendEmailVerificationCode(user.email);

    return user;
  }

  /* -------------------------------------------------------------------------- */
  /*                             EMAIL VERIFICATION                              */
  /* -------------------------------------------------------------------------- */

  async sendEmailVerificationCode(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await this.userModel.updateOne(
      { email },
      {
        emailVerificationCode: code,
        emailVerificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    );

    await this.mailerService.sendMail({
      to: email,
      subject: "Verify your email",
      html: `<h2>Your verification code</h2><h1>${code}</h1>`,
    });
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

  private async cleanupUnverifiedUsers() {
    await this.userModel.deleteMany({
      isEmailVerified: false,
      createdAt: { $lt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    });
  }
}
