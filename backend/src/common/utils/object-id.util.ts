import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";

export const parseObjectId = (
  value: string,
  label = "id",
): Types.ObjectId => {
  if (!Types.ObjectId.isValid(value)) {
    throw new BadRequestException(`Invalid ${label}`);
  }

  return new Types.ObjectId(value);
};

export const toObjectIdOrNull = (value?: string | Types.ObjectId | null) => {
  if (!value) {
    return null;
  }

  if (value instanceof Types.ObjectId) {
    return value;
  }

  return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
};
