import { AlertTriangle } from "lucide-react";

const EmergencyAlert = () => {
  return (
    <div className="rounded-xl bg-[#FFF8E7] p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
        <h3 className="font-medium text-[#B45309]">Emergency Alert</h3>
      </div>
      <p className="mt-1 text-sm text-[#92400E]">Sudden fall detected!</p>
    </div>
  );
};

export default EmergencyAlert;
