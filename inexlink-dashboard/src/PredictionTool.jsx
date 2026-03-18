import React, { useState } from 'react';
import { Target, Zap } from 'lucide-react';

const API = 'http://127.0.0.1:5000';

const MODEL_OPTIONS = [
    { value: 'xgboost', label: 'XGBoost (Tuned) — Sprint 6' },
    { value: 'random_forest', label: 'Random Forest (Tuned) — Sprint 6' },
    { value: 'ridge', label: 'Ridge Regression — Phase 1 baseline' },
];

const PredictionTool = () => {
    const [selectedModel, setSelectedModel] = useState('ridge');
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
        hours_per_year: 1600,
    });

    const [prediction, setPrediction] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked
            : type === 'number' ? parseFloat(value)
                : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setPrediction(null);

        try {
            const response = await fetch(`${API}/api/predict?model_name=${selectedModel}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Prediction request failed. Check the server console for errors.');
            setPrediction(await response.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Enter Equipment Details for a Live Prediction</h3>

                <div className="space-y-4">
                    {/* Model Selector */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <label className="block text-sm font-semibold text-blue-800 mb-1">Prediction Model</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => { setSelectedModel(e.target.value); setPrediction(null); }}
                            className="block w-full p-2 border border-blue-300 rounded-md bg-white text-gray-800 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            {MODEL_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-blue-600 mt-1">Switch models to compare predictions across Ridge, RF, and XGBoost</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Equipment Type</label>
                        <select name="equipment_type" value={formData.equipment_type} onChange={handleInputChange} className={inputClass}>
                            <option>Excavator</option><option>Dump Truck</option><option>Bulldozer</option>
                            <option>Wheel Loader</option><option>Crusher</option><option>Conveyor System</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                        <select name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} className={inputClass}>
                            <option>Caterpillar</option><option>Komatsu</option><option>Liebherr</option>
                            <option>Volvo</option><option>Hitachi</option><option>JCB</option><option>Generic</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Condition</label>
                        <select name="condition" value={formData.condition} onChange={handleInputChange} className={inputClass}>
                            <option>Excellent</option><option>Good</option><option>Fair</option><option>Needs Repair</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Age (Years)</label>
                            <input type="number" name="age_years" value={formData.age_years} onChange={handleInputChange} className={inputClass} step="0.1" min="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Listing Price ($)</label>
                            <input type="number" name="listing_price" value={formData.listing_price} onChange={handleInputChange} className={inputClass} />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="has_maintenance_records" checked={formData.has_maintenance_records} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                            <span className="text-sm text-gray-900">Maintenance Records</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="has_warranty" checked={formData.has_warranty} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                            <span className="text-sm text-gray-900">Includes Warranty</span>
                        </label>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-300 flex items-center justify-center"
                    >
                        <Zap className="w-5 h-5 mr-2" />
                        {isLoading ? 'Calculating...' : 'Get Live Prediction'}
                    </button>
                </div>
            </div>

            {/* Result Panel */}
            <div className="bg-gray-50 p-8 rounded-lg flex items-center justify-center border border-gray-200">
                <div className="text-center w-full">
                    {prediction && !isLoading && (
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                {prediction.model_display_name}
                            </p>
                            <p className="text-lg font-medium text-gray-600">Predicted Time to Sale</p>
                            <p className="text-7xl font-bold text-blue-600">{prediction.estimated_days_to_sale}</p>
                            <p className="text-2xl text-gray-500">days</p>
                            <p className="text-md text-gray-500">
                                ≈ {prediction.estimated_weeks} weeks
                            </p>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 mt-4">
                                <p className="text-sm text-gray-500 mb-1">Confidence Range</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    {prediction.confidence_interval[0]} – {prediction.confidence_interval[1]} days
                                </p>
                            </div>
                        </div>
                    )}
                    {!prediction && !isLoading && (
                        <>
                            <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500">Your live prediction result will appear here.</p>
                            <p className="text-sm text-gray-400 mt-2">Select a model and fill in the details to get started.</p>
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