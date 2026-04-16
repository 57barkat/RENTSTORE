"use client";

import StatCard from "@/app/components/stat-card";
import PropertyTrends from "@/app/components/sales-report";
import ContentStatus from "@/app/components/cost-breakdown";
import { Home, Users, Clock, ShieldAlert } from "lucide-react";

export interface DashboardData {
  overview: {
    users: { total: number; trend: number; lastMonth: number };
    properties: { total: number; trend: number; lastMonth: number };
    pendingProperties: number;
    blockedUsers: number;
  };
  trends: { name: string; uploads: number }[];
}

export default function DashboardScreen({
  initialData,
}: {
  initialData: DashboardData;
}) {
  const { overview, trends } = initialData;

  return (
    <div
      className="mx-auto max-w-[1600px] space-y-6 animate-in fade-in duration-500"
      style={{ width: "100%" }}
    >
      <div className="w-full grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={overview.users.total}
          trend={overview.users.trend}
          name="Last Month"
          lastMonth={overview.users.lastMonth}
          color="blue"
          icon={<Users size={20} />}
        />

        <StatCard
          title="Total Properties"
          value={overview.properties.total}
          trend={overview.properties.trend}
          name="Last Month"
          lastMonth={overview.properties.lastMonth}
          color="green"
          icon={<Home size={20} />}
        />

        <StatCard
          title="Pending Approvals"
          value={overview.pendingProperties}
          trend={0}
          name="Reason"
          lastMonth="Pending Review"
          color="orange"
          icon={<Clock size={20} />}
        />

        <StatCard
          title="Blocked Users"
          value={overview.blockedUsers}
          trend={0}
          name="Reason"
          lastMonth="Security"
          color="red"
          icon={<ShieldAlert size={20} />}
        />
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <PropertyTrends data={trends} />
        <ContentStatus overview={overview} />
      </div>
    </div>
  );
}
