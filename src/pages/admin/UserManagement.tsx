import { useEffect, useState } from 'react';
import { Users, Search } from 'lucide-react';
import { getAllUsers, updateUserRole } from '../../services/api';
import { Profile, UserRole } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const roleVariant: Record<UserRole, 'brand' | 'info' | 'warning'> = {
  STUDENT: 'brand',
  RECRUITER: 'info',
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
          <div className="animate-spin w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Account Management</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">{users.length} registered accounts across candidate, recruiter, and administrator roles.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search users by email address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'STUDENT', 'RECRUITER', 'ADMIN'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  roleFilter === r
                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <Card padding={false}>
          {filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No matching users found" icon={<Users className="w-8 h-8 text-slate-400" />} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Account</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">System Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Assign Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-center text-brand-700 text-xs font-extrabold">
                            {user.email[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {updating === user.id ? (
                            <div className="animate-spin w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full" />
                          ) : (
                            <select
                              value={user.role}
                              onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                              className="text-xs font-bold text-slate-700 border border-slate-300 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-xs"
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
