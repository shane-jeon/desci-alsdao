const healthMetrics = [
  {
    label: "SpO2 Saturation",
    value: "98%",
    icon: "⭕",
    color: "bg-green-50 text-green-700",
  },
  {
    label: "Sleep Quality",
    value: "7h 50m",
    icon: "💤",
    color: "bg-purple-50 text-purple-700",
  },
  {
    label: "Heart rate",
    value: "72 bpm",
    icon: "❤️",
    color: "bg-pink-50 text-pink-700",
  },
];

const HealthMetrics = () => {
  return (
    <div className="flex flex-col gap-3">
      {healthMetrics.map((metric, index) => (
        <div
          key={index}
          className={`flex items-center gap-3 rounded-xl p-4 ${metric.color}`}>
          <span className="text-xl">{metric.icon}</span>
          <div>
            <p className="text-sm font-medium">{metric.label}</p>
            <p className="text-lg font-semibold">{metric.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HealthMetrics;
