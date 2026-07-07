'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  FileText,
  CheckCircle,
  Database,
  TrendingUp,
  Clock,
  Sparkles,
  Activity,
  ArrowRight,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { adminService } from '@/services/admin.service';
import { ImportsOverTimeChart, LeadsByStatusChart } from '@/components/Charts';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalImports: 0,
    totalLeads: 0,
    successRate: 0,
    activeUsers: 0,
    pendingImports: 0,
    avgProcessingTime: 0,
    storageUsed: 0.1,
  });
  const [loading, setLoading] = useState(true);

  // Mock chart data for initial visual wow factor if live db is fresh
  const chartData = [
    { date: 'Mon', imports: 4 },
    { date: 'Tue', imports: 8 },
    { date: 'Wed', imports: 15 },
    { date: 'Thu', imports: 12 },
    { date: 'Fri', imports: 22 },
    { date: 'Sat', imports: 18 },
    { date: 'Sun', imports: 30 },
  ];

  const leadsByStatusData = [
    { name: 'New', value: 40 },
    { name: 'Contacted', value: 30 },
    { name: 'Qualified', value: 20 },
    { name: 'Lost', value: 10 },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStats();
      if (response.success && response.data) {
        const d = response.data;
        setStats({
          totalUsers: d.totalUsers || 0,
          totalImports: d.totalImports || 0,
          totalLeads: d.totalLeads || 0,
          successRate: d.successRate || 0,
          activeUsers: d.activeUsers || 0,
          pendingImports: d.pendingImports || 0,
          avgProcessingTime: Math.round((d.processingTimeAvg || 0) / 1000),
          storageUsed: Number(d.aiCostEstimates.toFixed(2)) || 0.1, // Using AI cost estimation in stats
        });
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-bg-tertiary"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-indigo-950 to-purple-900 text-white rounded-3xl p-8 overflow-hidden shadow-lg"
      >
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-grid opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Admin Center</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight mt-3">Platform Operations Center</h2>
          <p className="text-indigo-200 mt-2 max-w-xl text-sm font-medium leading-relaxed">
            Monitor API usage, processing analytics, file status metrics, and platform accounts in real-time.
          </p>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Platform Users"
          value={formatNumber(stats.totalUsers)}
          icon={Users}
          color="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Imports Completed"
          value={formatNumber(stats.totalImports)}
          icon={FileText}
          color="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total CRM Leads Saved"
          value={formatNumber(stats.totalLeads)}
          icon={Database}
          color="warning"
          trend={{ value: 24, isPositive: true }}
        />
        <StatCard
          title="Average Ingestion Accuracy"
          value={`${stats.successRate}%`}
          icon={CheckCircle}
          color="success"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-5 flex items-center gap-3">
          <Activity className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Active Importers</p>
            <p className="text-xl font-black text-text-primary mt-0.5">{stats.activeUsers}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <FileText className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Queued Imports</p>
            <p className="text-xl font-black text-text-primary mt-0.5">{stats.pendingImports}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <Clock className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Avg Processing Time</p>
            <p className="text-xl font-black text-text-primary mt-0.5">{stats.avgProcessingTime}s</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <Database className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Estimated LLM Cost</p>
            <p className="text-xl font-black text-text-primary mt-0.5">${stats.storageUsed}</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Imports Chart */}
        <div className="card lg:col-span-2 p-6">
          <h3 className="text-base font-bold text-text-primary mb-4">Ingestions Processed (Weekly)</h3>
          <ImportsOverTimeChart data={chartData} />
        </div>

        {/* Lead Distribution */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-text-primary mb-4">Leads by Status Ratio</h3>
          <LeadsByStatusChart data={leadsByStatusData} />
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-text-primary mb-4">System Panel Quick Navigation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/imports" className="p-5 border border-border-primary hover:border-accent/30 hover:bg-accent-bg/10 rounded-2xl transition-all duration-300 text-center">
            <FileText className="w-7 h-7 text-indigo-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-text-primary">Monitor All Imports</p>
            <p className="text-xs text-text-secondary mt-1">Review validation and failures</p>
          </Link>
          <Link href="/leads" className="p-5 border border-border-primary hover:border-accent/30 hover:bg-accent-bg/10 rounded-2xl transition-all duration-300 text-center">
            <Database className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-text-primary">Lead Database Explorer</p>
            <p className="text-xs text-text-secondary mt-1">Search, delete, and view profiles</p>
          </Link>
          <Link href="/analytics" className="p-5 border border-border-primary hover:border-accent/30 hover:bg-accent-bg/10 rounded-2xl transition-all duration-300 text-center">
            <TrendingUp className="w-7 h-7 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-text-primary">AI Extraction Analytics</p>
            <p className="text-xs text-text-secondary mt-1">LLM metrics and costs</p>
          </Link>
        </div>
      </div>
    </div>
  );
}


