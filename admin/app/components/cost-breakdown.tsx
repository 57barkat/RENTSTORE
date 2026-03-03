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

  return (
    <div className="bg-card p-6 rounded-[2.5rem] shadow-sm w-full lg:w-1/3 border border-border transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl text-foreground">Content Status</h3>
        <span className="text-[10px] bg-primary/10 px-3 py-1 rounded-full font-bold text-primary uppercase tracking-wider">
          Live
        </span>
      </div>

      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={75}
              outerRadius={95}
              paddingAngle={8}
              dataKey="value"
              animationBegin={0}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="var(--card-bg)"
                  strokeWidth={2}
                  className="hover:opacity-80 transition-opacity duration-300 outline-none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card-bg)",
                borderRadius: "1.25rem",
                border: "1px solid var(--border)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
              formatter={(
                value: string | number | (string | number)[] | undefined,
              ) => {
                const displayValue = Array.isArray(value) ? value[0] : value;
                return [displayValue ?? 0, "Amount"] as [
                  number | string,
                  string,
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-black text-foreground">
            {overview.properties.total}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
            Total Listings
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between bg-background border border-border/50 p-3 px-4 rounded-2xl hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shadow-sm group-hover:scale-110 transition-transform"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-600 dark:text-slate-300 font-semibold">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-black text-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
