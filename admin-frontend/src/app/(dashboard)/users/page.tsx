'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Users, FileCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin users:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-bold text-text-primary text-sm">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role || 'user';
        return (
          <span className={`badge ${role === 'admin' ? 'badge-danger' : 'badge-primary'} text-[10px] uppercase font-bold`}>
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-bold text-xs">
          <span className={`w-2 h-2 rounded-full ${row.original.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          <span className={row.original.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-secondary'}>
            {row.original.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Member Since',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM dd, yyyy'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-text-primary">User Accounts</h2>
        <p className="text-sm text-text-secondary mt-1">
          Monitor user accounts, roles, access permissions, and registration milestones.
        </p>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 flex items-center gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/25 p-3.5 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Registered Users</p>
            <p className="text-2xl font-black text-text-primary mt-1">{users.length}</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/25 p-3.5 rounded-xl text-emerald-600 dark:text-emerald-400">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Active Accounts</p>
            <p className="text-2xl font-black text-emerald-500 mt-1">
              {users.filter(u => u.isActive).length}
            </p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="bg-red-50 dark:bg-red-900/25 p-3.5 rounded-xl text-red-600 dark:text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Administrators</p>
            <p className="text-2xl font-black text-red-500 mt-1">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : users.length > 0 ? (
          <DataTable data={users} columns={columns} maxHeight="600px" />
        ) : (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary font-bold">No user accounts found</p>
          </div>
        )}
      </div>
    </div>
  );
}
