"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
 IndianRupee, 
  FileText, 
  Users, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Activity,
  Target,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const StatsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [statsData, setStatsData] = useState({
    revenueChart: [],
    invoiceStatusChart: [],
    clientGrowthChart: [],
    monthlyStats: [],
    topClients: [],
    paymentMethods: []
  });
  const [timeRange, setTimeRange] = useState('6months');

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadStatsData(token);
    } else {
      setError('No authentication token found');
      setLoading(false);
    }
  }, [loadStatsData]);

  const loadStatsData = async (token) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      // Fetch basic data
      const [userRes, clientsRes, invoicesRes] = await Promise.all([
        axios.get(`${API_URL}/api/users/profile`, config),
        axios.get(`${API_URL}/api/clients`, config),
        axios.get(`${API_URL}/api/invoices`, config),
      ]);

      setUserData(userRes.data);
      
      const clients = Array.isArray(clientsRes.data) ? clientsRes.data : [];
      const invoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];

      // Process data for charts
      const processedData = processStatsData(invoices, clients);
      setStatsData(processedData);
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to load stats data:", err);
      setError(`Failed to load data: ${err.response?.data?.message || err.message}`);
      setLoading(false);
    }
  };

  const processStatsData = (invoices, clients) => {
    // Revenue chart data (last 6 months)
    const revenueChart = generateRevenueChart(invoices);
    
    // Invoice status distribution
    const invoiceStatusChart = [
      { name: 'Paid', value: invoices.filter(inv => inv.status === 'paid').length, color: '#10B981' },
      { name: 'Unpaid', value: invoices.filter(inv => inv.status === 'unpaid').length, color: '#EF4444' },
      { name: 'Pending', value: invoices.filter(inv => inv.status === 'pending').length, color: '#F59E0B' },
      { name: 'Overdue', value: invoices.filter(inv => inv.status === 'overdue').length, color: '#8B5CF6' },
    ].filter(item => item.value > 0);

    // Client growth chart
    const clientGrowthChart = generateClientGrowthChart(clients);


    const monthlyStats = generateMonthlyStats(invoices);


    const topClients = generateTopClientsData(invoices, clients);

 
    const paymentMethods = [
      { name: 'Credit Card', value: 45, color: '#3B82F6' },
      { name: 'Bank Transfer', value: 30, color: '#10B981' },
      { name: 'PayPal', value: 20, color: '#F59E0B' },
      { name: 'Other', value: 5, color: '#8B5CF6' },
    ];

    return {
      revenueChart,
      invoiceStatusChart,
      clientGrowthChart,
      monthlyStats,
      topClients,
      paymentMethods
    };
  };

  const generateRevenueChart = (invoices) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: 0,
        invoices: 0
      });
    }

    invoices.forEach(invoice => {
      if (invoice.createdAt && invoice.status === 'paid') {
        const invoiceDate = new Date(invoice.createdAt);
        const monthIndex = months.findIndex(m => {
          const [monthName, year] = m.month.split(' ');
          const monthNum = new Date(Date.parse(monthName + " 1, 2021")).getMonth();
          return invoiceDate.getMonth() === monthNum && 
                 invoiceDate.getFullYear() === parseInt(year);
        });
        
        if (monthIndex >= 0) {
          months[monthIndex].revenue += invoice.total || 0;
          months[monthIndex].invoices += 1;
        }
      }
    });

    return months;
  };

  const generateClientGrowthChart = (clients) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        clients: 0,
        newClients: 0
      });
    }

    let cumulativeClients = 0;
    months.forEach((monthData, index) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - index) + 1, 0);
      
      const newClientsThisMonth = clients.filter(client => {
        const clientDate = new Date(client.createdAt || client.dateAdded || now);
        return clientDate >= monthStart && clientDate <= monthEnd;
      }).length;

      cumulativeClients += newClientsThisMonth;
      monthData.clients = cumulativeClients;
      monthData.newClients = newClientsThisMonth;
    });

    return months;
  };

  const generateMonthlyStats = (invoices) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.createdAt);
      return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
    });

    const lastMonthInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.createdAt);
      return invDate.getMonth() === lastMonth && invDate.getFullYear() === lastMonthYear;
    });

    const currentRevenue = currentMonthInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    const lastRevenue = lastMonthInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    return {
      currentMonth: {
        revenue: currentRevenue,
        invoices: currentMonthInvoices.length,
        paid: currentMonthInvoices.filter(inv => inv.status === 'paid').length,
      },
      lastMonth: {
        revenue: lastRevenue,
        invoices: lastMonthInvoices.length,
        paid: lastMonthInvoices.filter(inv => inv.status === 'paid').length,
      },
      revenueChange,
      invoiceChange: lastMonthInvoices.length > 0 ? 
        ((currentMonthInvoices.length - lastMonthInvoices.length) / lastMonthInvoices.length) * 100 : 0
    };
  };

  const generateTopClientsData = (invoices, clients) => {
    const clientRevenue = {};
    
    invoices.forEach(invoice => {
      if (invoice.status === 'paid' && invoice.clientId) {
        clientRevenue[invoice.clientId] = (clientRevenue[invoice.clientId] || 0) + (invoice.total || 0);
      }
    });

    return Object.entries(clientRevenue)
      .map(([clientId, revenue]) => {
        const client = clients.find(c => c._id === clientId);
        return {
          name: client?.name || 'Unknown Client',
          revenue,
          invoices: invoices.filter(inv => inv.clientId === clientId).length
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded-lg w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl h-32"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Stats</h1>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (token) loadStatsData(token);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center lg:text-left"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Analytics & Statistics
          </h1>
          <p className="text-gray-600 text-lg">
            Comprehensive insights for <span className="font-semibold">{userData?.name || 'your business'}</span>
          </p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <MetricCard
            title="Monthly Revenue"
            value={`₹${statsData.monthlyStats.currentMonth?.revenue?.toLocaleString() || '0'}`}
            change={statsData.monthlyStats.revenueChange}
            icon={<IndianRupee className="w-6 h-6" />}
            color="blue"
          />
          <MetricCard
            title="Monthly Invoices"
            value={statsData.monthlyStats.currentMonth?.invoices || 0}
            change={statsData.monthlyStats.invoiceChange}
            icon={<FileText className="w-6 h-6" />}
            color="green"
          />
          <MetricCard
            title="Paid This Month"
            value={statsData.monthlyStats.currentMonth?.paid || 0}
            change={0}
            icon={<CreditCard className="w-6 h-6" />}
            color="purple"
          />
          <MetricCard
            title="Collection Rate"
            value={`${statsData.monthlyStats.currentMonth?.invoices > 0 ? 
              Math.round((statsData.monthlyStats.currentMonth.paid / statsData.monthlyStats.currentMonth.invoices) * 100) : 0}%`}
            change={0}
            icon={<Target className="w-6 h-6" />}
            color="yellow"
          />
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Revenue Trend
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statsData.revenueChart}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Invoice Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Invoice Status Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData.invoiceStatusChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statsData.invoiceStatusChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Client Growth */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Client Growth
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statsData.clientGrowthChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="clients" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-600" />
              Payment Methods
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData.paymentMethods}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                  <Bar dataKey="value" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Top Clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Top Clients by Revenue
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Invoices</th>
                </tr>
              </thead>
              <tbody>
                {statsData.topClients.map((client, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{client.name}</td>
                    <td className="py-3 px-4 text-gray-600">₹{client.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600">{client.invoices}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    yellow: 'text-yellow-600 bg-yellow-100'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== 0 && (
            <div className={`flex items-center gap-1 mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsPage;
