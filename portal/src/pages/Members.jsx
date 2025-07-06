export default function Members() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Members</h1>
      <p className="text-lg text-gray-600 mb-4">
        Manage your organization's members and their profiles.
      </p>
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Member Directory</h3>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">+ Add Member</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
            <h4 className="font-semibold">John Doe</h4>
            <p className="text-gray-600">UK Chapter</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
            <h4 className="font-semibold">Jane Smith</h4>
            <p className="text-gray-600">MENA Chapter</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
            <h4 className="font-semibold">Ahmed Hassan</h4>
            <p className="text-gray-600">MENA Chapter</p>
          </div>
        </div>
      </div>
    </div>
  );
} 