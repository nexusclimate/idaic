export default function Admin() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <p className="text-lg text-gray-600 mb-4">
        Administrative tools and system management.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Database:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span>API Services:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Email Service:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Online</span>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded">Backup Database</button>
            <button className="w-full bg-yellow-500 text-white px-4 py-2 rounded">Clear Cache</button>
            <button className="w-full bg-red-500 text-white px-4 py-2 rounded">System Restart</button>
          </div>
        </div>
      </div>
    </div>
  );
} 