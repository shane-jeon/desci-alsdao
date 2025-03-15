import {
  Home,
  Bell,
  Calendar,
  BarChart2,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const userMetadata = user?.unsafeMetadata as
    | { patientName?: string }
    | undefined;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

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

      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">
              {userMetadata?.patientName || user?.fullName || "User"}
            </span>
            <span className="text-xs text-gray-600">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>
          <button className="ml-auto text-gray-400 hover:text-gray-600">
            ···
          </button>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
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
