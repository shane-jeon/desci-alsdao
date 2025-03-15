import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";

const data = [
  { date: "Nov 22", value: 2.5 },
  { date: "Dec 22", value: 4.5 },
  { date: "Jan 23", value: 3.2 },
];

const NeurofilamentCard = () => {
  return (
    <div className="rounded-xl bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Neurofilament light chain
          </h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-[#DC2626]">218.1</span>
            <span className="text-sm text-gray-700">pg/ml</span>
          </div>
          <p className="mt-1 text-xs text-gray-700">
            Normal value: <span className="font-medium">451 pg/dl</span>
          </p>
        </div>
        <button className="flex items-center gap-1 rounded-lg px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50">
          See All
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#374151", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#374151", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "none",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#DC2626"
            strokeWidth={2}
            dot={false}
            fill="url(#colorValue)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NeurofilamentCard;
