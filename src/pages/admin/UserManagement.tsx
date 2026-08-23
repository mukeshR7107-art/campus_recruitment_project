import { useEffect, useState } from 'react';
import { Users, Search, Shield } from 'lucide-react';
import { getAllUsers, updateUserRole } from '../../services/api';
import { Profile, UserRole } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const roleVariant: Record<UserRole, 'primary' | 'success' | 'warning'> = {
  STUDENT: 'primary',
  RECRUITER: 'success',
  ADMIN: 'warning',
};

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [updating, setUpdating] = useState<string | null>(null);

  function loadUsers() {
    getAllUsers().then(({ data }) => {
      setUsers((data ?? []) as Profile[]);
      setFiltered((data ?? []) as Profile[]);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    let list = users;
    if (roleFilter !== 'ALL') list = list.filter(u => u.role === roleFilter);
    if (search) list = list.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list);
  }, [search, roleFilter, users]);

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setUpdating(userId);
    await updateUserRole(userId, newRole);
    setUpdating(null);
    loadUsers();
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} registered users</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'STUDENT', 'RECRUITER', 'ADMIN'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  roleFilter === r
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <Card padding={false}>
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No users found" icon={<Users className="w-8 h-8" />} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-xs font-bold">
                            {user.email[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {updating === user.id ? (
                            <div className="animate-spin w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full" />
                          ) : (
                            <select
                              value={user.role}
                              onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                            >
                              <option value="STUDENT">STUDENT</option>
                              <option value="RECRUITER">RECRUITER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
