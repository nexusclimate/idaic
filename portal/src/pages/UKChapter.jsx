export default function UKChapter() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">UK Chapter</h1>
        </div>
      </div>
      <p className="text-base sm:text-lg text-gray-600 mb-4">
        Manage the UK chapter activities and members.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white border rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Chapter Stats</h3>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <span>Total Members:</span>
              <span className="font-semibold">45</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <span>Active Events:</span>
              <span className="font-semibold">3</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <span>This Month:</span>
              <span className="font-semibold">12 new members</span>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Recent Activity</h3>
          <ul className="space-y-2">
            <li>• New member registration</li>
            <li>• Event planning meeting</li>
            <li>• Content submission</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 