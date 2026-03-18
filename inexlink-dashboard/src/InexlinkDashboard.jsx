import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Calendar, Target, Activity, Zap, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import PredictionTool from './PredictionTool';

const API = 'http://127.0.0.1:5000';

// ── Loading skeleton ───────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const KPICardSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="w-14 h-14 rounded-lg" />
        </div>
    </div>
);

const ChartSkeleton = ({ height = 300 }) => (
    <div className="flex items-center justify-center bg-gray-50 rounded-lg" style={{ height }}>
        <div className="text-center space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-4 w-36 mx-auto" />
            <Skeleton className="h-4 w-44 mx-auto" />
        </div>
    </div>
);

const TableSkeleton = ({ rows = 4, cols = 4 }) => (
    <div className="space-y-2 p-6">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4">
                {Array.from({ length: cols }).map((_, j) => (
                    <Skeleton key={j} className="h-5 flex-1" />
                ))}
            </div>
        ))}
    </div>
);

// ── API status pill ────────────────────────────────────────────────────────────
const ApiStatusPill = ({ online }) => (
    <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${online ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        {online ? 'API online' : 'API offline'}
    </div>
);

// ── Section-level error ────────────────────────────────────────────────────────
const SectionError = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-gray-500 text-sm max-w-xs">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-md px-3 py-1.5"
            >
                <RefreshCw className="w-3 h-3" />
                Try again
            </button>
        )}
    </div>
);

// ── KPI card ──────────────────────────────────────────────────────────────────
const KPICard = ({ title, value, icon: Icon, change, prefix = '', suffix = '' }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900">
                    {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                </p>
                {change !== undefined && (
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

// ── Main dashboard ─────────────────────────────────────────────────────────────
const InexlinkDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [dashboardError, setDashboardError] = useState(null);

    const [featureImportance, setFeatureImportance] = useState([]);
    const [featureLoading, setFeatureLoading] = useState(true);
    const [featureError, setFeatureError] = useState(null);

    const [predictiveInsights, setPredictiveInsights] = useState([]);
    const [insightsLoading, setInsightsLoading] = useState(true);
    const [insightsError, setInsightsError] = useState(null);
    const [insightsModel, setInsightsModel] = useState('ridge');

    const [apiOnline, setApiOnline] = useState(null);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#F1948A'];

    // ── Fetch helpers ────────────────────────────────────────────────────────
    const fetchDashboardData = async () => {
        setDashboardLoading(true);
        setDashboardError(null);
        try {
            const res = await fetch(`${API}/api/dashboard_data`);
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            setDashboardData(await res.json());
            setApiOnline(true);
        } catch (err) {
            const msg = err.message.includes('Failed to fetch')
                ? 'Cannot reach the API. Make sure app.py is running on port 5000.'
                : `Failed to load dashboard: ${err.message}`;
            setDashboardError(msg);
            setApiOnline(false);
        } finally {
            setDashboardLoading(false);
        }
    };

    const fetchFeatureImportance = async () => {
        setFeatureLoading(true);
        setFeatureError(null);
        try {
            const res = await fetch(`${API}/api/feature_importance?model_name=ridge&top_n=8`);
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const data = await res.json();
            setFeatureImportance(data.feature_importance || []);
        } catch (err) {
            setFeatureError('Could not load feature importance.');
        } finally {
            setFeatureLoading(false);
        }
    };

    const fetchInsights = async (model) => {
        setInsightsLoading(true);
        setInsightsError(null);
        try {
            const res = await fetch(`${API}/api/predictive_insights?model_name=${model}`);
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const data = await res.json();
            setPredictiveInsights(data.insights || []);
        } catch (err) {
            setInsightsError('Could not load predictions. Check the API is running.');
            setPredictiveInsights([]);
        } finally {
            setInsightsLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);
    useEffect(() => { fetchFeatureImportance(); }, []);
    useEffect(() => { fetchInsights(insightsModel); }, [insightsModel]);

    // ── Full-page loading state ──────────────────────────────────────────────
    if (dashboardLoading) {
        return (
            <div className="min-h-screen bg-gray-100 font-sans">
                <div className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <Zap className="w-8 h-8 text-blue-600 mr-3" />
                            <h1 className="text-xl font-bold text-gray-900">Inexlink Predictive Analytics</h1>
                        </div>
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                            <Skeleton className="h-5 w-48 mb-4" />
                            <ChartSkeleton height={300} />
                        </div>
                        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                            <Skeleton className="h-5 w-40 mb-4" />
                            <ChartSkeleton height={300} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Full-page error state ────────────────────────────────────────────────
    if (dashboardError) {
        return (
            <div className="min-h-screen bg-gray-100 font-sans">
                <div className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <Zap className="w-8 h-8 text-blue-600 mr-3" />
                            <h1 className="text-xl font-bold text-gray-900">Inexlink Predictive Analytics</h1>
                        </div>
                        <ApiStatusPill online={false} />
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-red-50 rounded-full">
                        <WifiOff className="w-12 h-12 text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Dashboard unavailable</h2>
                    <p className="text-gray-500 max-w-md text-sm">{dashboardError}</p>
                    <div className="bg-gray-800 text-green-400 text-sm font-mono px-6 py-3 rounded-lg text-left">
                        <p className="text-gray-400 mb-1"># Start the API:</p>
                        <p>cd ~/inexlink_project/inexlink-backend</p>
                        <p>source venv/bin/activate</p>
                        <p>python3 app.py</p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry connection
                    </button>
                </div>
            </div>
        );
    }

    // ── Tab renderers ────────────────────────────────────────────────────────
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales &amp; Listings</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dashboardData.monthlyTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" /><YAxis />
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
                            <Pie data={dashboardData.equipmentPerformance} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {dashboardData.equipmentPerformance.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
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
                            <XAxis type="number" /><YAxis dataKey="type" type="category" width={100} />
                            <Tooltip formatter={(v, name) => name === 'Avg. Price' ? [`$${v.toLocaleString()}`, name] : [`${v} days`, name]} />
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
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="region" /><YAxis />
                            <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                            <Bar dataKey="revenue" fill="#00C49F" name="Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderPredictiveInsights = () => {
        const activeModel = dashboardData.modelPerformance?.[insightsModel] || {};
        const r2 = activeModel.rSquared != null ? activeModel.rSquared.toFixed(4) : 'N/A';
        const mae = activeModel.mae != null ? `${activeModel.mae.toFixed(2)} days` : 'N/A';

        const modelRows = Object.entries(dashboardData.modelPerformance).map(([key, m]) => ({
            key,
            label: m.label,
            r2: m.rSquared != null ? m.rSquared.toFixed(4) : '—',
            mae: m.mae != null ? m.mae.toFixed(2) : '—',
            rmse: m.rmse != null ? m.rmse.toFixed(2) : '—',
        }));

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Time to Sale R² Score</p>
                            <p className="text-3xl font-bold text-blue-600">{r2}</p>
                            <p className="text-xs text-gray-400 mt-1">{activeModel.label}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg"><Target className="w-8 h-8 text-blue-600" /></div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Prediction Error (MAE)</p>
                            <p className="text-3xl font-bold text-green-600">{mae}</p>
                            <p className="text-xs text-gray-400 mt-1">{activeModel.label}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg"><TrendingUp className="w-8 h-8 text-green-600" /></div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Last Model Update</p>
                            <p className="text-3xl font-bold text-gray-900">Daily</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg"><Activity className="w-8 h-8 text-gray-600" /></div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">Sprint 6 — Model Benchmark Comparison</h3>
                        <p className="text-sm text-gray-500 mt-1">Trained on synthetic dataset (n=2000). Real Inexlink data integration planned for Sprint 7.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["Model", "Test R²", "MAE (days)", "RMSE (days)", "Status"].map(h => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {modelRows.map((m) => (
                                    <tr key={m.key} className={m.key === insightsModel ? 'bg-blue-50' : ''}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {m.label}
                                            {m.key === insightsModel && (
                                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Active</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{m.r2}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{m.mae}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{m.rmse}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {m.key === 'ridge'
                                                ? <span className="text-gray-400">Phase 1 baseline</span>
                                                : <span className="text-green-600 font-medium">Sprint 6 ✓</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Sales Cycle Predictions</h3>
                            <div className="flex items-center gap-3">
                                {insightsLoading && <RefreshCw className="w-3.5 h-3.5 text-gray-400 animate-spin" />}
                                <select
                                    value={insightsModel}
                                    onChange={(e) => setInsightsModel(e.target.value)}
                                    disabled={insightsLoading}
                                    className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    <option value="ridge">Ridge Regression (default)</option>
                                    <option value="xgboost">XGBoost (Tuned)</option>
                                    <option value="random_forest">Random Forest (Tuned)</option>
                                </select>
                            </div>
                        </div>

                        {insightsError ? (
                            <SectionError message={insightsError} onRetry={() => fetchInsights(insightsModel)} />
                        ) : insightsLoading ? (
                            <TableSkeleton rows={4} cols={5} />
                        ) : predictiveInsights.length === 0 ? (
                            <div className="px-6 py-8 text-center text-gray-400 text-sm">No predictions available.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {["Equipment", "Listing Price", "Est. Days to Sale", "Confidence Range", "Recommendation"].map(h => (
                                                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {predictiveInsights.map((item) => {
                                            let recommendation, color;
                                            if (item.estimatedDays < 20) { recommendation = "Optimal Listing"; color = "text-green-600"; }
                                            else if (item.estimatedDays > 60) { recommendation = "Consider Repricing"; color = "text-red-600"; }
                                            else { recommendation = "Monitor Closely"; color = "text-yellow-600"; }
                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.equipment} <span className="text-gray-400 font-normal">({item.id})</span></td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.listingPrice.toLocaleString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{item.estimatedDays} days</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.confidence[0]}–{item.confidence[1]} days</td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${color}`}>{recommendation}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Key Factors in Sales Time</h3>
                        <p className="text-xs text-gray-400 mb-4">Live from Ridge model</p>
                        {featureError ? (
                            <SectionError message={featureError} onRetry={fetchFeatureImportance} />
                        ) : featureLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-10" />
                                        </div>
                                        <Skeleton className="h-2 w-full rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : featureImportance.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">No feature data available.</p>
                        ) : (
                            <div className="space-y-3">
                                {featureImportance.map((item) => (
                                    <div key={item.feature}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium truncate pr-2">{item.feature}</span>
                                            <span className="text-sm font-medium text-gray-500 shrink-0">{(item.importance * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${(item.importance / (featureImportance[0]?.importance || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <Zap className="w-8 h-8 text-blue-600 mr-3" />
                        <h1 className="text-xl font-bold text-gray-900">Inexlink Predictive Analytics</h1>
                    </div>
                    {apiOnline !== null && <ApiStatusPill online={apiOnline} />}
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'overview', name: 'Overview', icon: TrendingUp },
                            { id: 'analytics', name: 'Analytics', icon: Activity },
                            { id: 'ai_insights', name: 'AI Insights', icon: Target },
                            { id: 'prediction_tool', name: 'Get an Estimate', icon: Zap },
                        ].map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}>
                                <tab.icon className="w-5 h-5 mr-2" />{tab.name}
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