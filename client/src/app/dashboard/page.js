"use client";

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  CheckCircle,
  FileText,
  Users,
  IndianRupee,
  User,
  AlertCircle,
  BarChart2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── Utility: call webhook to mark invoice paid ───────────────────────────────
const processPaymentWebhook = async (invoiceId, sessionId, token) => {
  const invoiceRes = await axios.get(`${API_URL}/api/invoices/${invoiceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await axios.post(
    `${API_URL}/api/payments/webhook`,
    { invoiceId, status: 'paid', amount: invoiceRes.data.total, sessionId },
    {
    }
  );
  console.log(`Processed payment webhook for invoice ${invoiceId} with session ${sessionId}`, invoiceRes.data);
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, gradient }) => (
  <motion.div
    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-10`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

// ─── DashboardPage ────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    totalRevenue: 0,
  });
  const [userData, setUserData] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // ── Load dashboard data ────────────────────────────────────────────────────
  const loadDashboardData = useCallback(async (token) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const [clientsRes, invoicesRes] = await Promise.all([
        axios.get(`${API_URL}/api/clients`, config),
        axios.get(`${API_URL}/api/invoices`, config),
      ]);

      const clientsData = Array.isArray(clientsRes.data) ? clientsRes.data : [];
      const invoicesData = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];

      setClients(clientsData);

      const paid = invoicesData.filter((inv) => inv?.status === 'paid');
      const revenue = paid.reduce((sum, inv) => sum + (inv.total || 0), 0);

      setStats({
        totalClients: clientsData.length,
        totalInvoices: invoicesData.length,
        paidInvoices: paid.length,
        totalRevenue: revenue,
      });

      const sorted = [...invoicesData].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentInvoices(sorted.slice(0, 8));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(`Failed to load data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Handle redirect back from payment provider (success_url lands here) ────
  const handlePaymentReturn = useCallback(
    async (paymentStatus, invoiceId, sessionId) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        if (paymentStatus === 'success') {
          await processPaymentWebhook(invoiceId, sessionId, token);
          alert('Payment successful! Invoice marked as paid.');
          await loadDashboardData(token);
        } else if (paymentStatus === 'cancel') {
          alert('Payment was cancelled.');
        } else {
          alert('Payment failed. Please try again.');
        }
      } catch (err) {
        console.error('Error handling payment return:', err);
        alert('Error processing payment status. Please refresh the page.');
      } finally {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    },
    [loadDashboardData]
  );

  // ── On mount ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const invoiceId = urlParams.get('invoice_id');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus && invoiceId) {
      handlePaymentReturn(paymentStatus, invoiceId, sessionId);
    } else {
      loadDashboardData(token);
    }
  }, [loadDashboardData, handlePaymentReturn]);

  // ── Fetch user profile ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    fetchProfile();
  }, []);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-48 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => {
                const token = localStorage.getItem('token');
                if (token) loadDashboardData(token);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Billing & Invoices
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome back,{' '}
              <span className="font-semibold text-gray-800">{userData?.name || 'User'}</span>!
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/stats')}
            className="self-start lg:self-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md flex items-center gap-2"
          >
            <BarChart2 className="w-4 h-4" />
            STATS
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={<Users className="text-blue-600 w-8 h-8" />}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            icon={<FileText className="text-purple-600 w-8 h-8" />}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Paid Invoices"
            value={stats.paidInvoices}
            icon={<CheckCircle className="text-green-600 w-8 h-8" />}
            gradient="from-green-500 to-green-600"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={<IndianRupee className="text-yellow-600 w-8 h-8" />}
            gradient="from-yellow-500 to-yellow-600"
          />
        </motion.div>

        {/* Clients Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Recent Clients ({clients.length})
            </h2>
          </div>

          {clients.length > 0 ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.slice(0, 6).map((client, index) => (
                  <motion.div
                    key={client._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No clients found</p>
              <p className="text-gray-400 text-sm">Create your first client to get started</p>
            </div>
          )}
        </motion.div>

        {/* Recent Invoices — read-only summary, no actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Recent Invoices ({recentInvoices.length})
            </h2>
          </div>

          {recentInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Invoice ID', 'Amount', 'Start Date', 'Due Date', 'Status'].map((col) => (
                      <th
                        key={col}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentInvoices.map((invoice, index) => (
                    <motion.tr
                      key={invoice._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            #{invoice._id?.slice(-6) || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{invoice.total?.toLocaleString() || '0'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.createdAt
                          ? new Date(invoice.createdAt).toLocaleDateString('en-GB')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString('en-GB')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'unpaid'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {invoice.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No recent invoices found</p>
              <p className="text-gray-400 text-sm">Create your first invoice to get started</p>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default DashboardPage;