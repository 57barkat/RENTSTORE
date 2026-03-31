import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Agency, AgencyDocument } from "./agency.entity";
import { User, UserDocument, UserRole } from "../user/user.entity";

@Injectable()
export class AgencyService {
  constructor(
    @InjectModel(Agency.name)
    private agencyModel: Model<AgencyDocument>,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async createAgency(userId: string, name: string) {
    const agency = await this.agencyModel.create({
      name,
      owner: userId,
      agents: [userId],
    });

    await this.userModel.findByIdAndUpdate(userId, {
      agency: agency._id,
      role: UserRole.AGENCY,
      propertyLimit: 9999,
    });

    return agency;
  }

  async addAgent(agencyId: string, agentId: string) {
    const agency = await this.agencyModel.findById(agencyId);
    if (!agency) throw new NotFoundException("Agency not found");

    agency.agents.push(new Types.ObjectId(agentId));
    await agency.save();

    await this.userModel.findByIdAndUpdate(agentId, {
      agency: agencyId,
      role: UserRole.AGENCY,
      propertyLimit: 9999,
    });

    return { message: "Agent added" };
  }
}
