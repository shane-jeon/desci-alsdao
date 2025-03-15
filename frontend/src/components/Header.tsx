import { Send, LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/router";

const Header = () => {
  const { signOut } = useClerk();
  const router = useRouter();
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between">
      <div></div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
          chat
          <Send size={16} className="text-white" />
        </button>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200">
          Sign out
          <LogOut size={16} />
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{formattedDate}</span>
          <button className="rounded bg-gray-100 p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
