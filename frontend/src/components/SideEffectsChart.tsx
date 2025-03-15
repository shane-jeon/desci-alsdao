import { MedicationAdherence } from "@/services/api";

interface SideEffectsChartProps {
  medicationData: MedicationAdherence | undefined;
}

export default function SideEffectsChart({
  medicationData,
}: SideEffectsChartProps) {
  if (!medicationData) {
    return <div>No medication data available</div>;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-black">
        Medication Side Effects
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-gray-600">Current Medications</p>
          <ul className="list-disc pl-5">
            {medicationData.current_medications.map(
              (med: string, index: number) => (
                <li key={index} className="text-black">
                  {med}
                </li>
              ),
            )}
          </ul>
        </div>
        <div>
          <p className="text-gray-600">Side Effects</p>
          <ul className="list-disc pl-5">
            {medicationData.side_effects.map(
              (effect: string, index: number) => (
                <li key={index} className="text-black">
                  {effect}
                </li>
              ),
            )}
          </ul>
        </div>
        <div>
          <p className="text-gray-600">Missed Doses (Last 30 Days)</p>
          <p className="text-black">{medicationData.missed_doses}</p>
        </div>
      </div>
    </div>
  );
}
