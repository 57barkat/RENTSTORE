import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../user/user.entity";
import { Property, PropertyDocument } from "../property/property.schema";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
  ) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // For the chart: Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

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
      // Aggregation for Daily Property Trends
      this.propertyModel.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dayOfWeek: "$createdAt" }, // Returns 1 (Sun) to 7 (Sat)
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Format Trend Chart Data to ensure all days are present
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const formattedTrends = days.map((day, index) => {
      const found = propertyTrendsRaw.find((item) => item._id === index + 1);
      return {
        name: day,
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
