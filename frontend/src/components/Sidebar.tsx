import { Home, Bell, Calendar, BarChart2, Settings, User } from "lucide-react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

const Sidebar = () => {
  const { user } = useUser();
  const userMetadata = user?.unsafeMetadata as
    | { patientName?: string }
    | undefined;

  return (
    <aside className="flex h-screen w-[240px] flex-col bg-white p-6">
      <div className="flex justify-center">
        <Image
          src="/alsdao_logo.svg"
          alt="ALS DAO"
          width={180}
          height={48}
          className="h-auto w-auto"
        />
      </div>

      <div className="mt-8">
        <span className="text-xs font-medium text-gray-500">Menu</span>
        <nav className="mt-4 flex flex-col gap-2">
          <NavItem icon={Home} label="Dashboard" active />
          <NavItem icon={Calendar} label="Medication reminder" />
          <NavItem icon={BarChart2} label="Reports" />
          <NavItem icon={Bell} label="Notifications" />
          <NavItem icon={Settings} label="Settings" />
        </nav>
      </div>

      <div className="mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {userMetadata?.patientName || user?.fullName || "User"}
            </span>
            <span className="text-xs text-gray-500">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>
          <button className="ml-auto text-gray-400">···</button>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) => (
  <div
    className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 text-sm
    ${
      active
        ? "bg-blue-50 font-medium text-blue-600"
        : "text-gray-700 hover:bg-gray-50"
    }`}>
    <Icon size={20} />
    <span>{label}</span>
  </div>
);

export default Sidebar;
