export default function Content() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Content Management</h1>
      <p className="text-base sm:text-lg text-gray-600 mb-4">
        Manage your organization's content, articles, and resources.
      </p>
      <div className="bg-white border rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">Content Library</h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-gray-50 rounded gap-2 sm:gap-0">
            <span>Annual Report 2024</span>
            <button className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto">Edit</button>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-gray-50 rounded gap-2 sm:gap-0">
            <span>Member Guidelines</span>
            <button className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto">Edit</button>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-gray-50 rounded gap-2 sm:gap-0">
            <span>Event Calendar</span>
            <button className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto">Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
} 