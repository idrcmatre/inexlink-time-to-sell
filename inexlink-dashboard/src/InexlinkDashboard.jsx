import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Calendar, Target, Activity, Zap } from 'lucide-react';
import PredictionTool from './PredictionTool'; // Import the new component

// --- Helper Components ---
const KPICard = ({ title, value, icon: Icon, change, prefix = '', suffix = '' }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900">
                    {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                </p>
                {change && (
                    <div className={`flex items-center mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        <span className="text-sm font-medium">{Math.abs(change)}% vs last period</span>
                    </div>
                )}
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
                <Icon className="w-8 h-8 text-blue-600" />
            </div>
        </div>
    </div>
);

// --- Main Dashboard Component ---
const InexlinkDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState(null); // Start with null data
    const [error, setError] = useState(null); // For error handling

    // This useEffect hook is the core of the frontend-backend integration.
    // It runs once when the component mounts.
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/api/dashboard_data');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setDashboardData(data); // Populate state with data from the API
            } catch (error) {
                setError(error.message);
                console.error("Failed to fetch dashboard data:", error);
            }
        };
        fetchDashboardData();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#F1948A'];

    // Loading and error states
    if (error) {
        return <div className="text-center p-8 text-red-500 font-semibold">Failed to load dashboard data: {error}. Is the Python backend server running?</div>;
    }
    if (!dashboardData) {
        return <div className="text-center p-8 text-gray-500 font-semibold">Loading dashboard data...</div>;
    }

    // --- RENDER LOGIC for each Tab ---
    // These components now use `dashboardData` from the state, which is populated by the API.
    const renderOverview = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KPICard title="Total Sales Revenue" value={dashboardData.kpis.totalRevenue} icon={DollarSign} change={12.3} prefix="$" />
                <KPICard title="Average Listing Price" value={dashboardData.kpis.avgListingPrice} icon={TrendingUp} change={8.7} prefix="$" />
                <KPICard title="Average Time to Sale" value={dashboardData.kpis.avgTimeToSale} icon={Calendar} change={-15.2} suffix=" days" />
                <KPICard title="Total Listings" value={dashboardData.kpis.totalListings} icon={Package} change={18.9} />
                <KPICard title="Active Listings" value={dashboardData.kpis.activeListings} icon={Activity} change={-3.1} />
                <KPICard title="Top Seller Type" value="Mining Co." icon={Users} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales & Listings</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dashboardData.monthlyTrends}>
                            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis />
                            <Tooltip /><Legend />
                            <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} name="Items Sold" />
                            <Line type="monotone" dataKey="listings" stroke="#82ca9d" strokeWidth={2} name="New Listings" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Equipment</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={dashboardData.equipmentPerformance} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {dashboardData.equipmentPerformance.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Type Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dashboardData.sellerTypePerformance} layout="vertical" margin={{ left: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="type" type="category" width={100} />
                            <Tooltip
                                formatter={(value, name) => {
                                    if (name === 'Avg. Price') {
                                        return [`$${value.toLocaleString()}`, 'Avg. Price'];
                                    } else {
                                        return [`${value} days`, 'Avg. Time to Sale'];
                                    }
                                }}
                            />
                            <Legend />
                            <Bar dataKey="avgPrice" fill="#0088FE" name="Avg. Price" />
                            <Bar dataKey="avgTimeToSale" fill="#FF8042" name="Avg. Time to Sale" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Sales Revenue</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dashboardData.regionalData}>
                            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="region" /><YAxis />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} /><Bar dataKey="revenue" fill="#00C49F" name="Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderPredictiveInsights = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                    <div><p className="text-sm font-medium text-gray-500">Time to Sale R² Score</p><p className="text-3xl font-bold text-blue-600">{dashboardData.modelPerformance.rSquared}</p></div>
                    <div className="p-3 bg-blue-50 rounded-lg"><Target className="w-8 h-8 text-blue-600" /></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                    <div><p className="text-sm font-medium text-gray-500">Prediction Error (MAE)</p><p className="text-3xl font-bold text-green-600">{dashboardData.modelPerformance.mae} days</p></div>
                    <div className="p-3 bg-green-50 rounded-lg"><TrendingUp className="w-8 h-8 text-green-600" /></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                    <div><p className="text-sm font-medium text-gray-500">Last Model Update</p><p className="text-3xl font-bold text-gray-900">Daily</p></div>
                    <div className="p-3 bg-gray-50 rounded-lg"><Activity className="w-8 h-8 text-gray-600" /></div>
                </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b"><h3 className="text-lg font-semibold text-gray-900">AI-Powered Sales Cycle Predictions</h3></div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listing Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Days to Sale</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recommendation</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dashboardData.predictiveInsights.map((item) => {
                                    let recommendation, color;
                                    if (item.estimatedDays < 20) { recommendation = "Optimal Listing"; color = "text-green-600"; }
                                    else if (item.estimatedDays > 60) { recommendation = "Consider Repricing"; color = "text-red-600"; }
                                    else { recommendation = "Monitor Closely"; color = "text-yellow-600"; }
                                    return (<tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.equipment} ({item.id})</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.listingPrice.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{item.estimatedDays} days</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${color}`}>{recommendation}</td>
                                    </tr>);
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Factors in Sales Time</h3>
                    <div className="space-y-3">
                        {dashboardData.featureImportance.map((item) => (
                            <div key={item.feature}>
                                <div className="flex justify-between mb-1"><span className="text-sm font-medium">{item.feature}</span><span className="text-sm font-medium text-gray-500">{(item.importance * 100).toFixed(1)}%</span></div>
                                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(item.importance / dashboardData.featureImportance[0].importance) * 100}%` }}></div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center"><Zap className="w-8 h-8 text-blue-600 mr-3" /><h1 className="text-xl font-bold text-gray-900">Inexlink Predictive Analytics</h1></div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'overview', name: 'Overview', icon: TrendingUp },
                            { id: 'analytics', name: 'Analytics', icon: Activity },
                            { id: 'ai_insights', name: 'AI Insights', icon: Target },
                            { id: 'prediction_tool', name: 'Get an Estimate', icon: Zap }
                        ].map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}>
                                <tab.icon className="w-5 h-5 mr-2" /> {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'ai_insights' && renderPredictiveInsights()}
                {activeTab === 'prediction_tool' && <PredictionTool />}
            </main>
        </div>
    );
};

export default InexlinkDashboard;