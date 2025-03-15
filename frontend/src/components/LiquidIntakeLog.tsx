import { MoreHorizontal } from "lucide-react";

const logEntries = [
  { time: "8:00 am", amount: "250 ml" },
  { time: "8:75 am", amount: "200 ml" },
  { time: "9:00 am", amount: "580 ml" },
  { time: "9:25 am", amount: "200 ml" },
  { time: "10:00 am", amount: "250 ml" },
];

const LiquidIntakeLog = () => {
  return (
    <div className="rounded-xl bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          Liquid Intake Log
        </h3>
        <button className="rounded-lg p-1 hover:bg-gray-100">
          <MoreHorizontal className="h-5 w-5 text-gray-400" />
        </button>
      </div>
      <div className="space-y-3">
        {logEntries.map((entry, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">💧</span>
              <span className="text-sm text-gray-700">{entry.amount}</span>
            </div>
            <span className="text-sm text-gray-500">{entry.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiquidIntakeLog;
