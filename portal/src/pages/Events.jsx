import { colors } from '../config/colors';

export default function Events() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events</h1>
        </div>
      </div>
      <p className="text-base sm:text-lg text-gray-600 mb-4">
        Manage and view upcoming events across all chapters.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white border rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold">Annual Conference</h4>
              <p className="text-gray-600">March 15, 2024 • London</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold">Workshop Series</h4>
              <p className="text-gray-600">April 2, 2024 • Dubai</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Create New Event</h3>
          <button className="w-full sm:w-auto bg-green-500 text-white px-6 py-3 rounded-lg">+ Add Event</button>
        </div>
      </div>
    </div>
  );
} 