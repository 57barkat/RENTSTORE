"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ContentStatusProps {
  overview: {
    users: { total: number };
    properties: { total: number };
    pendingProperties: number;
    blockedUsers: number;
  };
}

export default function ContentStatus({ overview }: ContentStatusProps) {
  const chartData = [
    {
      name: "Approved",
      value: overview.properties.total - overview.pendingProperties,
      color: "#22c55e",
    },
    { name: "Pending", value: overview.pendingProperties, color: "#f97316" },
    { name: "Blocked", value: overview.blockedUsers, color: "#ef4444" },
  ];

  const totalActions = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm w-full lg:w-1/3 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">Content Status</h3>
        <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full font-bold text-gray-500 uppercase">
          Live
        </span>
      </div>

      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={8}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "15px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label: Total Properties */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-gray-800">
            {overview.properties.total}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
            Total Listings
          </span>
        </div>
      </div>

      {/* Legend items from existing API data */}
      <div className="mt-4 grid grid-cols-1 gap-2">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between bg-gray-50 p-2 px-3 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-600 font-semibold">
                {item.name}
              </span>
            </div>
            <span className="text-xs font-bold text-gray-800">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
