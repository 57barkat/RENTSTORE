import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Interval } from "@nestjs/schedule";
import { Model, Types } from "mongoose";
import { Property } from "./property.schema";
import { getRedis } from "../../common/redis/redis.service";

const VIEW_HASH_KEY = "property:views:pending";
const VIEW_PROCESSING_HASH_KEY = "property:views:processing";
const VIEW_FLUSH_LOCK_KEY = "property:views:flush-lock";
const FLUSH_LOCK_TTL_MS = 30_000;

const PREPARE_HASH_FOR_FLUSH_SCRIPT = `
if redis.call("EXISTS", KEYS[2]) == 1 then
  return 1
end

if redis.call("EXISTS", KEYS[1]) == 0 then
  return 0
end

redis.call("RENAME", KEYS[1], KEYS[2])
return 1
`;

@Injectable()
export class PropertyViewTrackerService {
  private readonly logger = new Logger(PropertyViewTrackerService.name);
  private flushInProgress = false;

  constructor(
    @InjectModel(Property.name) private readonly propertyModel: Model<Property>,
  ) {}

  async queueView(propertyId: string) {
    try {
      await getRedis().hincrby(VIEW_HASH_KEY, propertyId, 1);
    } catch (error) {
      this.logger.warn(`Failed to queue property view in Redis: ${String(error)}`);
    }
  }

  @Interval(5000)
  async flushPendingViews() {
    if (this.flushInProgress) {
      return;
    }

    this.flushInProgress = true;

    try {
      const lockAcquired = await getRedis().set(
        VIEW_FLUSH_LOCK_KEY,
        String(Date.now()),
        { nx: true, px: FLUSH_LOCK_TTL_MS },
      );

      if (!lockAcquired) {
        return;
      }

      const hasBatch = await getRedis().eval<[], number>(
        PREPARE_HASH_FOR_FLUSH_SCRIPT,
        [VIEW_HASH_KEY, VIEW_PROCESSING_HASH_KEY],
        [],
      );

      if (!hasBatch) {
        return;
      }

      const entries = await getRedis().hgetall<Record<string, string | number>>(
        VIEW_PROCESSING_HASH_KEY,
      );
      const batch = Object.entries(entries ?? {})
        .map(([propertyId, count]) => [propertyId, Number(count)] as const)
        .filter(([, count]) => Number.isFinite(count) && count > 0);

      if (batch.length === 0) {
        await getRedis().del(VIEW_PROCESSING_HASH_KEY);
        return;
      }

      await this.propertyModel.bulkWrite(
        batch.map(([propertyId, count]) => ({
          updateOne: {
            filter: { _id: new Types.ObjectId(propertyId) },
            update: { $inc: { views: count } },
          },
        })),
        { ordered: false },
      );

      await getRedis().del(VIEW_PROCESSING_HASH_KEY);
    } catch (error) {
      this.logger.warn(`Failed to flush property views: ${String(error)}`);
    } finally {
      try {
        await getRedis().del(VIEW_FLUSH_LOCK_KEY);
      } catch (error) {
        this.logger.warn(`Failed to release property view flush lock: ${String(error)}`);
      }
      this.flushInProgress = false;
    }
  }
}
