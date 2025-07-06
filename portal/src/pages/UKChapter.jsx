export default function UKChapter() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">UK Chapter</h1>
      <p className="text-lg text-gray-600 mb-4">
        Manage the UK chapter activities and members.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Chapter Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Members:</span>
              <span className="font-semibold">45</span>
            </div>
            <div className="flex justify-between">
              <span>Active Events:</span>
              <span className="font-semibold">3</span>
            </div>
            <div className="flex justify-between">
              <span>This Month:</span>
              <span className="font-semibold">12 new members</span>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
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