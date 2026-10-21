'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RefreshCw, Search, ShieldAlert, UserMinus, UserCheck, Key, Shield, Users, Sparkles, Briefcase, Loader2, Eye, Pencil, Trash2, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UserTableProps {
  currentUserRole: 'ADMIN' | 'SUPER_ADMIN';
}

export function UserTable({ currentUserRole }: UserTableProps) {
  const searchParams = useSearchParams();
  const urlRole = searchParams ? searchParams.get('role') : null;

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(500);
  
  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>(urlRole || '');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Sync roleFilter with URL query param whenever it changes
  useEffect(() => {
    if (urlRole !== null) {
      setRoleFilter(urlRole);
      setPage(1);
    }
  }, [urlRole]);

  const userCategoryTabs = [
    { label: 'All Users', value: '', icon: Users },
    { label: 'Talents', value: 'TALENT', icon: Sparkles },
    { label: 'Clients', value: 'CLIENT', icon: Briefcase },
    { label: 'Employees & Crew', value: 'EMPLOYEE', icon: UserCheck },
    { label: 'Admins', value: 'ADMIN', icon: Shield },
  ];

  // Direct 1-click status toggle between Active (Green) and Inactive (Red)
  const handleToggleStatus = async (userId: string, currentIsActive: boolean, userName: string) => {
    setTogglingId(userId);
    try {
      const endpoint = currentIsActive
        ? `/api/admin/users/${userId}/deactivate`
        : `/api/admin/users/${userId}/reactivate`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Operation failed');
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentIsActive } : u))
      );
      toast.success(
        !currentIsActive
          ? `🟢 ${userName} is now ACTIVE & approved!`
          : `🔴 ${userName} has been marked INACTIVE.`
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status.');
    } finally {
      setTogglingId(null);
    }
  };

  // Modal / Confirmations
  const [confirmAction, setConfirmAction] = useState<{
    type: 'role' | 'reset-mfa' | 'deactivate' | 'reactivate' | 'delete';
    userId: string;
    userName: string;
    payload?: any;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // View User Modal State
  const [viewUser, setViewUser] = useState<User | null>(null);

  // Edit User Modal State
  const [editUser, setEditUser] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    password?: string;
  } | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(roleFilter && { role: roleFilter }),
      });

      const res = await fetch(`/api/admin/users?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }

      const json = await res.json();
      setUsers(json.data || []);
      setTotal(json.total || 0);
      setTotalPages(json.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load user directory.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, debouncedSearch, roleFilter]);

  // Save Edit User
  const handleSaveEdit = async () => {
    if (!editUser) return;
    if (editUser.password && editUser.password.trim().length > 0 && editUser.password.trim().length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to update user');
      }
      toast.success('User updated successfully!');
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  // Executing Action API Calls
  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);

    const { type, userId, payload } = confirmAction;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      let endpoint = '';
      let method = 'PATCH';
      let body: string | undefined = undefined;

      if (type === 'role') {
        endpoint = `/api/admin/users/${userId}/role`;
        body = JSON.stringify({ role: payload.newRole });
      } else if (type === 'deactivate') {
        endpoint = `/api/admin/users/${userId}/deactivate`;
      } else if (type === 'reactivate') {
        endpoint = `/api/admin/users/${userId}/reactivate`;
      } else if (type === 'reset-mfa') {
        endpoint = `/api/admin/users/${userId}/reset-mfa`;
        method = 'POST';
      } else if (type === 'delete') {
        endpoint = `/api/admin/users/${userId}`;
        method = 'DELETE';
      }

      const res = await fetch(endpoint, { method, headers, body });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Operation failed');
      }

      toast.success(
        type === 'delete' ? 'User permanently deleted.' :
        type === 'role' ? 'User role updated successfully.' :
        type === 'deactivate' ? 'User account suspended.' :
        type === 'reactivate' ? 'User account reactivated.' :
        'MFA reset completed successfully.'
      );
      
      setConfirmAction(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const rolesList = [
    'SUPER_ADMIN',
    'ADMIN',
    'PROJECT_MANAGER',
    'EDITOR',
    'EMPLOYEE',
    'TALENT',
    'CLIENT',
    'GUEST'
  ];

  return (
    <div className="space-y-6">
      {/* Category Tabs: Separate Clients, Talents, Staff, Admins */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        {userCategoryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = roleFilter === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => {
                setRoleFilter(tab.value);
                setPage(1);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? 'bg-brand text-white border-brand shadow-sm'
                  : 'bg-surface text-muted-foreground border-border hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface p-4 border border-border rounded-xl shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:border-primary transition-colors font-medium"
            title="Rows per page"
          >
            <option value={500}>All Users (500)</option>
            <option value={100}>100 per page</option>
            <option value={50}>50 per page</option>
            <option value={20}>20 per page</option>
            <option value={10}>10 per page</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">All Roles</option>
            {rolesList.map((r) => (
              <option key={r} value={r}>
                {r.replace('_', ' ')}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="p-2 border border-border rounded-lg bg-background hover:bg-surface text-foreground transition-colors disabled:opacity-50"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs uppercase tracking-widest font-semibold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4.5">
                      <div className="h-4 bg-muted/40 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No users found matching the criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => {
                          const newRole = e.target.value;
                          setConfirmAction({
                            type: 'role',
                            userId: user.id,
                            userName: `${user.firstName} ${user.lastName}`,
                            payload: { oldRole: user.role, newRole },
                          });
                        }}
                        className="px-2.5 py-1 border border-border rounded-lg bg-background text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
                      >
                        {rolesList.map((r) => (
                          <option
                            key={r}
                            value={r}
                            disabled={r === 'SUPER_ADMIN' && currentUserRole !== 'SUPER_ADMIN'}
                          >
                            {r.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        disabled={togglingId === user.id}
                        onClick={() =>
                          handleToggleStatus(user.id, user.isActive, `${user.firstName} ${user.lastName}`)
                        }
                        title={
                          user.isActive
                            ? 'Status: Active (Click to make Inactive)'
                            : 'Status: Inactive (Click to make Active)'
                        }
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer border ${
                          user.isActive
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                        } ${togglingId === user.id ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        {togglingId === user.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              user.isActive
                                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                                : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                            }`}
                          />
                        )}
                        <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground" suppressHydrationWarning>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Button */}
                        <button
                          onClick={() => setViewUser(user)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/80 hover:border-brand hover:text-brand bg-card text-foreground text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          title="View User Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">View</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditUser({
                            id: user.id,
                            firstName: user.firstName || '',
                            lastName: user.lastName || '',
                            email: user.email,
                            role: user.role,
                            isActive: user.isActive,
                            password: '',
                          })}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/80 hover:border-blue-500 hover:text-blue-500 bg-card text-foreground text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setConfirmAction({
                            type: 'delete',
                            userId: user.id,
                            userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                          })}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-500/30 hover:border-rose-500 text-rose-500 hover:bg-rose-500/10 bg-card text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>

                        {/* Reset MFA Button (Super Admin only) */}
                        {currentUserRole === 'SUPER_ADMIN' && (
                          <button
                            onClick={() => {
                              setConfirmAction({
                                type: 'reset-mfa',
                                userId: user.id,
                                userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                              });
                            }}
                            className="p-1.5 rounded-lg border border-border/80 hover:border-amber-500 hover:text-amber-500 bg-card text-muted-foreground text-xs transition-colors cursor-pointer"
                            title="Reset Multi-Factor Authentication"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-muted/10">
            <span className="text-xs text-muted-foreground">
              Showing page <strong className="text-foreground">{page}</strong> of{' '}
              <strong className="text-foreground">{totalPages}</strong> ({total} total users)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-border rounded-lg bg-background text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-50 disabled:hover:bg-background transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-border rounded-lg bg-background text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-50 disabled:hover:bg-background transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 space-y-6 animate-scaleIn">
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-lg ${confirmAction.type === 'delete' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'}`}>
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif text-foreground">
                  {confirmAction.type === 'delete' ? 'Delete User Permanently' : 'Confirm Security Action'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {confirmAction.type === 'delete' && (
                    <>
                      Are you sure you want to permanently delete user{' '}
                      <strong className="text-rose-500 font-bold">{confirmAction.userName}</strong>? This will permanently delete their account, profile data, and all permissions. This action cannot be undone.
                    </>
                  )}
                  {confirmAction.type === 'role' && (
                    <>
                      Are you sure you want to change the role of{' '}
                      <strong className="text-foreground">{confirmAction.userName}</strong> from{' '}
                      <strong className="text-foreground">{confirmAction.payload.oldRole}</strong> to{' '}
                      <strong className="text-primary font-bold">{confirmAction.payload.newRole}</strong>?
                    </>
                  )}
                  {confirmAction.type === 'deactivate' && (
                    <>
                      Are you sure you want to suspend{' '}
                      <strong className="text-foreground">{confirmAction.userName}</strong>? This user will immediately lose access to all portals and digital workspaces.
                    </>
                  )}
                  {confirmAction.type === 'reactivate' && (
                    <>
                      Are you sure you want to reactivate the account for{' '}
                      <strong className="text-foreground">{confirmAction.userName}</strong>? Access to their corresponding portals will be restored immediately.
                    </>
                  )}
                  {confirmAction.type === 'reset-mfa' && (
                    <>
                      Are you sure you want to reset Multi-Factor Authentication (MFA) for{' '}
                      <strong className="text-foreground">{confirmAction.userName}</strong>? They will be prompted to re-register their TOTP secret key on their next secure dashboard login.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border border-border hover:bg-muted/10 rounded-lg text-sm font-semibold text-foreground transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmAction}
                className={`px-4 py-2 font-bold rounded-lg text-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer ${
                  confirmAction.type === 'delete' 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                {confirmAction.type === 'delete' ? 'Delete User' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW USER MODAL ── */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-6 animate-scaleIn relative">
            <button
              onClick={() => setViewUser(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-border pb-4">
              <div className="w-14 h-14 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-xl uppercase">
                {viewUser.firstName?.[0] || viewUser.email[0]}
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-foreground">
                  {viewUser.firstName} {viewUser.lastName}
                </h3>
                <p className="text-xs text-muted-foreground">{viewUser.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand/10 text-brand border border-brand/20">
                    {viewUser.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    viewUser.isActive ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
                  }`}>
                    {viewUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-card border border-border/80">
                <span className="text-muted-foreground block mb-1">User ID:</span>
                <span className="font-mono text-foreground font-semibold break-all">{viewUser.id}</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/80">
                <span className="text-muted-foreground block mb-1">Joined Date:</span>
                <span className="font-semibold text-foreground">
                  {viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              {viewUser.role === 'TALENT' && (
                <a
                  href={`/talent`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-brand font-bold hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View on Talent Discovery Feed
                </a>
              )}
              <button
                onClick={() => setViewUser(null)}
                className="ml-auto px-4 py-2 bg-muted/40 hover:bg-muted text-foreground font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT USER MODAL ── */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5 animate-scaleIn relative">
            <button
              onClick={() => setEditUser(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-border pb-3">
              <h3 className="text-lg font-serif font-bold text-foreground">Edit User Profile</h3>
              <p className="text-xs text-muted-foreground">Update user name, email, role, or access status.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">First Name</label>
                  <input
                    type="text"
                    value={editUser.firstName}
                    onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Last Name</label>
                  <input
                    type="text"
                    value={editUser.lastName}
                    onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Email Address</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">System Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-brand cursor-pointer"
                >
                  {rolesList.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">Update Password (Optional)</label>
                  <span className="text-[10px] text-muted-foreground">Min. 6 chars</span>
                </div>
                <input
                  type="password"
                  value={editUser.password || ''}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  placeholder="Leave empty to keep existing password"
                  autoComplete="new-password"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-brand placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80">
                <div>
                  <span className="font-semibold text-foreground block">Account Status</span>
                  <span className="text-[11px] text-muted-foreground">Toggle active portal login access</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditUser({ ...editUser, isActive: !editUser.isActive })}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    editUser.isActive ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
                  }`}
                >
                  {editUser.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                disabled={editLoading}
                onClick={() => setEditUser(null)}
                className="px-4 py-2 border border-border hover:bg-muted/10 rounded-lg text-xs font-semibold text-foreground transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={editLoading}
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-brand text-white hover:brightness-110 font-bold rounded-lg text-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {editLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
