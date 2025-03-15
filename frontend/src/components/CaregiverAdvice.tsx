import { CaregiverAdvice as CaregiverAdviceType } from "@/services/api";

interface CaregiverAdviceProps {
  advice: CaregiverAdviceType | null;
  isLoading?: boolean;
}

export default function CaregiverAdvice({
  advice,
  isLoading = false,
}: CaregiverAdviceProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="text-gray-500">Loading caregiver advice...</div>
      </div>
    );
  }

  if (!advice) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="text-gray-500">No caregiver advice available</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold text-black">
        Caregiver Advice
      </h3>

      {/* General Advice Section */}
      <div className="mb-8">
        <h4 className="mb-4 font-medium text-black">Daily Care Guidelines</h4>
        <div className="space-y-4">
          {advice.generalAdvice.map((item, index) => (
            <div key={index} className="rounded-lg bg-gray-50 p-4">
              <h5 className="mb-2 font-medium text-black">{item.title}</h5>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Guidelines Section */}
      <div className="mb-8">
        <h4 className="mb-4 font-medium text-black">Emergency Guidelines</h4>

        {/* Breathing Difficulties */}
        <div className="mb-4">
          <h5 className="mb-2 font-medium text-black">
            Breathing Difficulties
          </h5>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-red-700">
              {advice.emergencyGuidelines.breathing}
            </p>
          </div>
        </div>

        {/* Falls */}
        <div>
          <h5 className="mb-2 font-medium text-black">Falls</h5>
          <div className="rounded-lg bg-orange-50 p-4">
            <p className="text-orange-700">
              {advice.emergencyGuidelines.falls}
            </p>
          </div>
        </div>
      </div>

      {/* Support Resources Section */}
      <div>
        <h4 className="mb-4 font-medium text-black">Support Resources</h4>
        <div className="space-y-4">
          {advice.resources.map((resource, index) => (
            <div key={index} className="rounded-lg bg-green-50 p-4">
              <h5 className="mb-2 font-medium text-green-800">
                {resource.name}
              </h5>
              <div className="space-y-1 text-green-700">
                <p>Type: {resource.type}</p>
                <p>Contact: {resource.contact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
