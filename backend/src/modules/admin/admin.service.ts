import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../user/user.entity";
import { Property, PropertyDocument } from "../property/property.schema";
import {
  buildDashboardActivityBuckets,
  getDashboardActivityWindow,
  normalizeDashboardActivityRange,
} from "./admin-dashboard-range.util";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
  ) {}

  async getDashboardStats(range?: string) {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const activityRange = normalizeDashboardActivityRange(range);
    const activityWindow = getDashboardActivityWindow(activityRange, now);
    const activityBuckets = buildDashboardActivityBuckets(activityRange, now);

    const [
      totalUsers,
      totalProperties,
      pendingProperties,
      blockedUsers,
      usersLastMonth,
      propertiesLastMonth,
      propertyTrendsRaw, // Chart data
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.propertyModel.countDocuments(),
      this.propertyModel.countDocuments({ isApproved: false }),
      this.userModel.countDocuments({ isBlocked: true }),
      this.userModel.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
      }),
      this.propertyModel.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
      }),
      this.propertyModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: activityWindow.start,
              $lte: activityWindow.end,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const formattedTrends = activityBuckets.map((bucket) => {
      const found = propertyTrendsRaw.find((item) => item._id === bucket.key);
      return {
        name: bucket.name,
        fullLabel: bucket.fullLabel,
        uploads: found ? found.count : 0,
      };
    });

    const calculateTrend = (current: number, lastMonth: number) => {
      if (lastMonth === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - lastMonth) / lastMonth) * 100);
    };

    return {
      overview: {
        users: {
          total: totalUsers,
          lastMonth: usersLastMonth,
          trend: calculateTrend(totalUsers, usersLastMonth),
        },
        properties: {
          total: totalProperties,
          lastMonth: propertiesLastMonth,
          trend: calculateTrend(totalProperties, propertiesLastMonth),
        },
        pendingProperties,
        blockedUsers,
      },
      trends: formattedTrends,
    };
  }
}
