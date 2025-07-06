export default function MENAChapter() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">MENA Chapter</h1>
      <p className="text-lg text-gray-600 mb-4">
        Manage the MENA (Middle East and North Africa) chapter activities and members.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Chapter Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Members:</span>
              <span className="font-semibold">78</span>
            </div>
            <div className="flex justify-between">
              <span>Active Events:</span>
              <span className="font-semibold">5</span>
            </div>
            <div className="flex justify-between">
              <span>This Month:</span>
              <span className="font-semibold">23 new members</span>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <ul className="space-y-2">
            <li>• Regional conference planning</li>
            <li>• New partnership announcement</li>
            <li>• Member workshop completed</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 