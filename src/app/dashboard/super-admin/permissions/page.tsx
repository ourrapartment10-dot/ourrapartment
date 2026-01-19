'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, Shield, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function PermissionsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'SUPER_ADMIN') {
        // router.push("/dashboard");
      } else {
        fetchUsers();
      }
    }
  }, [user, isLoading]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/super-admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/super-admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role', error);
    }
  };

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading || loadingUsers) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Shield className="h-6 w-6 text-blue-600" />
              Permissions Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage user roles and access levels across the platform.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full rounded-xl border border-gray-200 py-2 pr-4 pl-10 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              className="min-w-[150px] appearance-none rounded-xl border border-gray-200 bg-white py-2 pr-8 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="USER">User</option>
              <option value="RESIDENT">Resident</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="transition-colors hover:bg-gray-50/80"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-bold text-blue-700 ring-4 ring-white">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {u.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {u.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs leading-5 font-bold ${
                          u.role === UserRole.ADMIN
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : u.role === UserRole.SUPER_ADMIN
                              ? 'border-purple-200 bg-purple-50 text-purple-700'
                              : u.role === UserRole.RESIDENT
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="block w-full max-w-[140px] cursor-pointer rounded-lg border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        disabled={
                          u.role === UserRole.SUPER_ADMIN && u.id === user?.id
                        } // Prevent changing own role if logged in as that super admin
                      >
                        <option value={UserRole.USER}>User (Guest)</option>
                        <option value={UserRole.RESIDENT}>Resident</option>
                        <option value={UserRole.ADMIN}>Admin</option>
                        <option value={UserRole.SUPER_ADMIN}>
                          Super Admin
                        </option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
