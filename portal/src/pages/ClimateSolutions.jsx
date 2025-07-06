export default function ClimateSolutions() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Climate Solution News</h1>
      <p className="text-lg text-gray-600 mb-4">
        Latest news and updates on climate solutions and innovations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Featured Solutions</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold">Solar Energy Breakthrough</h4>
              <p className="text-gray-600">New perovskite solar cells achieve 30% efficiency</p>
              <p className="text-sm text-gray-500 mt-1">March 20, 2024</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold">Carbon Capture Technology</h4>
              <p className="text-gray-600">Direct air capture facility removes 1M tons CO2 annually</p>
              <p className="text-sm text-gray-500 mt-1">March 18, 2024</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold">Green Hydrogen Production</h4>
              <p className="text-gray-600">Electrolysis efficiency improved by 40%</p>
              <p className="text-sm text-gray-500 mt-1">March 15, 2024</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Innovation Spotlight</h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800">Ocean Cleanup Initiative</h4>
              <p className="text-green-700">Revolutionary floating barriers collect 90% of ocean plastic</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-800">Smart Grid Technology</h4>
              <p className="text-orange-700">AI-powered energy distribution reduces waste by 25%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 