// src/pages/home.jsx

import {
  Sidebar,
  SidebarBody,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from "../components/sidebar";
import {
  HomeIcon,
  Square2StackIcon,
  TicketIcon,
  MegaphoneIcon,
  Cog6ToothIcon,
} from "@heroicons/react/20/solid";
import RichTextSection from "../components/RichTextSection";

export default function Home() {
  return (
    <div>
      <div className="mb-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome to IDAIC</h1>
        </div>
      </div>
      <p className="text-base sm:text-lg text-gray-600 mb-4">
        Welcome to the IDAIC portal. This is your central hub for managing chapters, content, and resources.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Quick Actions</h3>
          <ul className="space-y-2 text-sm sm:text-base">
            <li>• View recent content</li>
            <li>• Check upcoming events</li>
            <li>• Manage members</li>
          </ul>
        </div>
        <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Recent Activity</h3>
          <ul className="space-y-2 text-sm sm:text-base">
            <li>• New member joined</li>
            <li>• Event scheduled</li>
            <li>• Content updated</li>
          </ul>
        </div>
      </div>
      <div className="mt-8">
        <RichTextSection section="home_content" />
      </div>
    </div>
  );
}