export default function UAEClimate() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">UAE Climate News</h1>
      <p className="text-lg text-gray-600 mb-4">
        Latest climate news and initiatives from the United Arab Emirates.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">UAE Climate Initiatives</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold">Net Zero 2050 Strategy</h4>
              <p className="text-gray-600">UAE announces comprehensive roadmap to carbon neutrality</p>
              <p className="text-sm text-gray-500 mt-1">March 22, 2024</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold">Masdar City Expansion</h4>
              <p className="text-gray-600">World's first zero-carbon city expands sustainable infrastructure</p>
              <p className="text-sm text-gray-500 mt-1">March 19, 2024</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold">Solar Energy Investment</h4>
              <p className="text-gray-600">$50 billion investment in renewable energy projects</p>
              <p className="text-sm text-gray-500 mt-1">March 16, 2024</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Regional Impact</h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800">COP28 Legacy</h4>
              <p className="text-blue-700">UAE leads global climate action with innovative partnerships</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-800">Green Economy Vision</h4>
              <p className="text-orange-700">Transition to sustainable economic model accelerates</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800">Desert Greening</h4>
              <p className="text-green-700">Innovative techniques transform arid landscapes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 