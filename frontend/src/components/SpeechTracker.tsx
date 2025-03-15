import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SpeechSwallowing } from "@/services/api";

interface SpeechTrackerProps {
  speechData: SpeechSwallowing | undefined;
}

const data = [
  { month: "Jan", value: 85 },
  { month: "Feb", value: 120 },
  { month: "Mar", value: 75 },
  { month: "Apr", value: 130 },
  { month: "May", value: 90 },
  { month: "Jun", value: 110 },
  { month: "Jul", value: 85 },
  { month: "Aug", value: 100 },
  { month: "Sep", value: 120 },
  { month: "Oct", value: 95 },
  { month: "Nov", value: 110 },
  { month: "Dec", value: 100 },
];

export default function SpeechTracker({ speechData }: SpeechTrackerProps) {
  if (!speechData) {
    return <div>No speech data available</div>;
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Speech clarity tracker
        </h3>
        <div className="flex gap-2">
          <button className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            Sort by
          </button>
          <button className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            Monthly
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
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
            stroke="#4F46E5"
            strokeWidth={2}
            dot={false}
            fill="url(#colorValue)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
