import { MotorFunction } from "@/services/api";

interface MotorFunctionChartProps {
  motorData: MotorFunction | undefined;
}

export default function MotorFunctionChart({
  motorData,
}: MotorFunctionChartProps) {
  if (!motorData) {
    return <div>No motor function data available</div>;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-black">
        Motor Function Assessment
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-gray-600">Muscle Strength</p>
          <p className="text-black">{motorData.muscle_strength}/5</p>
        </div>
        <div>
          <p className="text-gray-600">Range of Motion</p>
          <p className="text-black">{motorData.range_of_motion}°</p>
        </div>
        <div>
          <p className="text-gray-600">Balance Score</p>
          <p className="text-black">{motorData.balance_score}/10</p>
        </div>
        <div>
          <p className="text-gray-600">Coordination Level</p>
          <p className="text-black">{motorData.coordination_level}</p>
        </div>
      </div>
    </div>
  );
}
