"use client";

import React, { useEffect, useState } from "react";
import StatCard from "@/app/components/stat-card";
import apiClient from "@/app/lib/api-client";
import { Home, Users, Clock, ShieldAlert, Loader2 } from "lucide-react";
import PropertyTrends from "@/app/components/sales-report";
import ContentStatus from "@/app/components/cost-breakdown";

interface DashboardData {
  overview: {
    users: { total: number; trend: number; lastMonth: number };
    properties: { total: number; trend: number; lastMonth: number };
    pendingProperties: number;
    blockedUsers: number;
  };
  trends: { name: string; uploads: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get("/admin/stats");
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const { overview, trends } = data!;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={overview.users.total}
          trend={overview.users.trend}
          lastMonth={overview.users.lastMonth}
          color="blue"
          icon={<Users size={20} />}
        />

        <StatCard
          title="Total Properties"
          value={overview.properties.total}
          trend={overview.properties.trend}
          lastMonth={overview.properties.lastMonth}
          color="green"
          icon={<Home size={20} />}
        />

        <StatCard
          title="Pending Approvals"
          value={overview.pendingProperties}
          trend={0}
          lastMonth="Needs Review"
          color="orange"
          icon={<Clock size={20} />}
        />

        <StatCard
          title="Blocked Users"
          value={overview.blockedUsers}
          trend={0}
          lastMonth="Security"
          color="red"
          icon={<ShieldAlert size={20} />}
        />
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <PropertyTrends data={trends} />
        <ContentStatus overview={overview} />
      </div>
    </div>
  );
}
