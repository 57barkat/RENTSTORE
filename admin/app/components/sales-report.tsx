"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PropertyTrendsProps {
  data: { name: string; uploads: number }[];
}

export default function PropertyTrends({ data }: PropertyTrendsProps) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm flex-1 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-lg text-gray-800">Property Uploads</h3>
          <p className="text-xs text-muted-foreground">
            Daily activity for the last 7 days
          </p>
        </div>
        <select className="text-sm border border-gray-100 rounded-lg px-2 py-1 outline-none bg-gray-50">
          <option>Last 7 Days</option>
        </select>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "#f9fafb" }}
              contentStyle={{
                borderRadius: "15px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            />
            <Bar
              dataKey="uploads"
              fill="#22c55e"
              fillOpacity={0.5}
              radius={[6, 6, 6, 6]}
              barSize={35}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
