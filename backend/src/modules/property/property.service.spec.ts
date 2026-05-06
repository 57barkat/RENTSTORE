import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import { PropertyService } from "./property.service";

const createSession = () => ({
  withTransaction: jest.fn(async (callback: () => Promise<void>) => callback()),
  endSession: jest.fn(),
});

describe("PropertyService security guards", () => {
  const userId = new Types.ObjectId().toString();

  const createService = () => {
    const session = createSession();
    const propertyModel = {
      findById: jest.fn(),
      updateMany: jest.fn().mockResolvedValue(undefined),
    };
    const userModel = {
      findById: jest.fn(),
    };
    const service = new PropertyService(
      {
        startSession: jest.fn().mockResolvedValue(session),
      } as any,
      propertyModel as any,
      {} as any,
      userModel as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    return {
      service,
      session,
      propertyModel,
      userModel,
    };
  };

  it("rejects invalid property ids before querying MongoDB", async () => {
    const { service, propertyModel } = createService();

    await expect(
      service.findPropertyById("not-an-object-id"),
    ).rejects.toThrow(new BadRequestException("Invalid property id"));
    expect(propertyModel.findById).not.toHaveBeenCalled();
  });

  it("prevents self-promotion without paid credits", async () => {
    const { service, propertyModel, userModel } = createService();
    const propertySave = jest.fn();
    const userSave = jest.fn();

    propertyModel.findById.mockReturnValue({
      session: jest.fn().mockResolvedValue({
        ownerId: new Types.ObjectId(userId),
        isApproved: true,
        address: [],
        featured: false,
        isBoosted: false,
        sortWeight: 1,
        save: propertySave,
      }),
    });
    userModel.findById.mockReturnValue({
      session: jest.fn().mockResolvedValue({
        paidFeaturedCredits: 0,
        prioritySlotCredits: 0,
        save: userSave,
      }),
    });

    await expect(
      service.promoteListing(new Types.ObjectId().toString(), userId, "featured"),
    ).rejects.toThrow(new BadRequestException("No Featured Credits remaining."));
    expect(userSave).not.toHaveBeenCalled();
    expect(propertySave).not.toHaveBeenCalled();
  });
});
