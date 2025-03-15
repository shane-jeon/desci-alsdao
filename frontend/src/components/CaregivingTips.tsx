import { ChevronDown, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface CaregiverAdvice {
  advice: string[];
  resources: {
    pd: typeof pdResources;
    als: typeof alsResources;
  };
}

const pdResources = [
  {
    name: "Parkinson's Foundation",
    url: "https://www.parkinson.org/resources-support/pd-library",
  },
  {
    name: "American Parkinson Disease Association",
    url: "https://www.apdaparkinson.org/resources-support/",
  },
  {
    name: "Stanford Parkinson's Community Outreach",
    url: "https://med.stanford.edu/parkinsons/caregiver-corner/caregiver-resources.html",
  },
];

const alsResources = [
  {
    name: "ALS Association",
    url: "https://www.als.org/navigating-als/for-caregivers/caregiver-resources",
  },
  {
    name: "VA Caregiver Support Program",
    url: "https://www.caregiver.va.gov/Tips_by_Diagnosis/ALS.asp",
  },
  {
    name: "CDC Resources",
    url: "https://www.atsdr.cdc.gov/emes/ALS/training/page527.html",
  },
];

const CaregivingTips = () => {
  const { isSignedIn } = useUser();
  const [advice, setAdvice] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/caregiver-advice");
        if (!response.ok) {
          throw new Error("Failed to fetch advice");
        }
        const data: CaregiverAdvice = await response.json();
        setAdvice(data.advice);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchAdvice();
    }
  }, [isSignedIn]);

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 rounded bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-black">Caregiving Tips</h3>
        <button className="flex items-center gap-1 rounded-lg px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50">
          See All
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4">
        {advice.length > 0 && (
          <div className="rounded-xl bg-[#FEF3C7] p-4">
            <div className="flex items-center gap-2">
              <span className="text-[#D97706]">⚠️</span>
              <span className="text-sm font-medium text-[#92400E]">
                Important Advice
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {advice.map((tip, index) => (
                <p key={index} className="text-sm text-[#92400E]">
                  {tip}
                </p>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-xl bg-[#ECFDF3] p-4">
          <div className="flex items-center gap-2">
            <span className="text-[#059669]">✅</span>
            <span className="text-sm font-medium text-[#065F46]">
              PD Resources
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {pdResources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-[#065F46] hover:underline">
                {resource.name}
                <ExternalLink className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-[#FEF3C7] p-4">
          <div className="flex items-center gap-2">
            <span className="text-[#D97706]">📝</span>
            <span className="text-sm font-medium text-[#92400E]">
              ALS Resources
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {alsResources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-[#92400E] hover:underline">
                {resource.name}
                <ExternalLink className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregivingTips;
