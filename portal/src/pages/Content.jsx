export default function Content() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Content Management</h1>
      <p className="text-lg text-gray-600 mb-4">
        Manage your organization's content, articles, and resources.
      </p>
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Content Library</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
            <span>Annual Report 2024</span>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">Edit</button>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
            <span>Member Guidelines</span>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">Edit</button>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
            <span>Event Calendar</span>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
} 