export default function Feedback() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Feedback</h1>
      <p className="text-lg text-gray-600 mb-4">
        View and manage feedback from members and stakeholders.
      </p>
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Feedback</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="font-semibold">Great event organization!</p>
            <p className="text-gray-600">The annual conference was well-planned and informative.</p>
            <p className="text-sm text-gray-500 mt-1">- Sarah Johnson, UK Chapter</p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <p className="font-semibold">Need more regional events</p>
            <p className="text-gray-600">Would love to see more events in the MENA region.</p>
            <p className="text-sm text-gray-500 mt-1">- Ahmed Hassan, MENA Chapter</p>
          </div>
        </div>
      </div>
    </div>
  );
} 