import React, { useState } from 'react';
import { Target, Zap } from 'lucide-react';

const PredictionTool = () => {
  // This state holds all the inputs for the model.
  // Default values are set to create a reasonable starting point for the user.
  const [formData, setFormData] = useState({
    equipment_type: 'Excavator',
    manufacturer: 'Caterpillar',
    condition: 'Good',
    age_years: 5.0,
    listing_price: 250000,
    operating_hours: 8000,
    original_value: 450000,
    location: 'Western Australia',
    seller_type: 'Mining Company',
    has_maintenance_records: true,
    has_warranty: false,
    photos_count: 10,
    description_length: 300,
    listing_month: 6,
    price_to_original_ratio: 0.55,
    hours_per_year: 1600
  });

  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle numbers and booleans correctly
    const finalValue = type === 'checkbox' ? checked : 
                      (type === 'number' ? parseFloat(value) : value);
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPrediction(null);

    try {
      // This is the API call to your Python backend
      const response = await fetch('http://127.0.0.1:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Prediction request failed. Check the server console for errors.');
      }

      const result = await response.json();
      setPrediction(result);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Form Column */}
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Enter Equipment Details for a Live Prediction</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* We'll show a few key inputs, but all are being sent in the background */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Equipment Type</label>
            <select name="equipment_type" value={formData.equipment_type} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
              <option>Excavator</option> <option>Dump Truck</option> <option>Bulldozer</option>
              <option>Wheel Loader</option> <option>Crusher</option> <option>Conveyor System</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Condition</label>
            <select name="condition" value={formData.condition} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
              <option>Excellent</option> <option>Good</option> <option>Fair</option> <option>Needs Repair</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Age (Years)</label>
            <input type="number" name="age_years" value={formData.age_years} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Listing Price ($)</label>
            <input type="number" name="listing_price" value={formData.listing_price} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="flex items-center pt-2">
             <input type="checkbox" id="has_warranty" name="has_warranty" checked={formData.has_warranty} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
             <label htmlFor="has_warranty" className="ml-2 block text-sm text-gray-900">Includes Warranty</label>
          </div>
          
          <button type="submit" disabled={isLoading} className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-300 flex items-center justify-center">
            <Zap className="w-5 h-5 mr-2" /> {isLoading ? 'Calculating...' : 'Get Live Prediction'}
          </button>
        </form>
      </div>

      {/* Prediction Result Column */}
      <div className="bg-gray-50 p-8 rounded-lg flex items-center justify-center border border-gray-200">
        <div className="text-center">
          {prediction && !isLoading && (
            <>
              <p className="text-lg font-medium text-gray-600">Predicted Time to Sale</p>
              <p className="text-6xl font-bold text-blue-600 my-4">{prediction.estimated_days_to_sale} days</p>
              <p className="text-md text-gray-500">Confidence Range: {prediction.confidence_interval[0]} - {prediction.confidence_interval[1]} days</p>
            </>
          )}
          {!prediction && !isLoading && (
            <>
             <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Your live prediction result will appear here.</p>
            </>
          )}
          {isLoading && <p className="text-gray-500">Getting prediction from the model...</p>}
          {error && <p className="text-red-600 mt-4 font-semibold">Error: {error}</p>}
        </div>
      </div>
    </div>
  );
};

export default PredictionTool;
