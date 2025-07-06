export default function Changelog() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Changelog</h1>
      <p className="text-lg text-gray-600 mb-4">
        Track updates and changes to the IDAIC platform.
      </p>
      <div className="bg-white border rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-600">v2.1.0 - March 15, 2024</h3>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Added new member management features</li>
              <li>Improved event scheduling system</li>
              <li>Enhanced chapter analytics</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-600">v2.0.0 - February 28, 2024</h3>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Complete platform redesign</li>
              <li>New sidebar navigation</li>
              <li>Improved mobile responsiveness</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 