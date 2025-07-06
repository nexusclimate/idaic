export default function Events() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Events</h1>
      <p className="text-lg text-gray-600 mb-4">
        Manage and view upcoming events across all chapters.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
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
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Create New Event</h3>
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg">
            + Add Event
          </button>
        </div>
      </div>
    </div>
  );
} 