'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  Mail,
  Phone,
  Calendar,
  Crown,
  Shield,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  AlertTriangle,
  Trash2,
  Users,
  Package
} from 'lucide-react';


const roleOptions = [
  { value: '', label: 'All Users', color: 'text-gray-600 bg-gray-50' },
  { value: 'user', label: 'Customers', color: 'text-blue-600 bg-blue-50' },
  { value: 'admin', label: 'Admins', color: 'text-purple-600 bg-purple-50' }
];

const sortOptions = [
  { value: 'createdAt', label: 'Join Date' },
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'role', label: 'Role' }
];

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearch, roleFilter, sortBy, sortOrder]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (roleFilter) params.set('role', roleFilter);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const newUrl = `/admin/users${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newUrl);
  }, [searchTerm, roleFilter, sortBy, sortOrder, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }

      if (roleFilter) {
        params.set('role', roleFilter);
      }

      if (sortBy !== 'createdAt') {
        params.set('sortBy', sortBy);
      }

      if (sortOrder !== 'desc') {
        params.set('sortOrder', sortOrder);
      }

      console.log('🔍 Fetching admin users with params:', params.toString());

      const response = await fetch(`/api/admin/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch users');
      }

      setUsers(result.data.users);
      setTotalPages(result.data.pages);
      setTotalUsers(result.data.total);
      setHasNext(result.data.hasNext);
      setHasPrev(result.data.hasPrev);

      console.log('✅ Admin users fetched successfully:', {
        total: result.data.total
      });
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Change field and default to desc
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingRole(userId);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to update user role');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update user role');
      }

      // Refresh users
      await fetchUsers();

      console.log('✅ User role updated successfully');

    } catch (err) {
      console.error('❌ Error updating user role:', err);
      alert(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingUser(userId);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete user');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete user');
      }

      // Refresh users
      await fetchUsers();

      console.log('✅ User deleted successfully');

    } catch (err) {
      console.error('❌ Error deleting user:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setDeletingUser(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'user':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent border-r-transparent border-b-transparent mx-auto mb-4"></div>
          <p className="text-lg text-dark-gray">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Users</h1>
          <p className="text-dark-gray">
            {totalUsers > 0
              ? `Manage ${totalUsers} users`
              : 'No users found'
            }
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="lg:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary"
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary mb-2">Error Loading Users</h3>
            <p className="text-dark-gray mb-6">{error}</p>
            <button
              onClick={fetchUsers}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-secondary mb-2">No Users Found</h3>
            <p className="text-dark-gray mb-6">
              {searchTerm || roleFilter
                ? 'No users match your current filters.'
                : 'No users have registered yet.'
              }
            </p>
            <div className="space-y-3">
              {(searchTerm || roleFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('');
                  }}
                  className="btn btn-outline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="border-b border-medium-gray p-4">
              <div className="text-sm text-dark-gray">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalUsers)} of {totalUsers} users
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-medium-gray bg-light-bg">
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">User</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center space-x-1 hover:text-primary transition-colors duration-200"
                      >
                        <span>Name</span>
                        {sortBy === 'name' && (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center space-x-1 hover:text-primary transition-colors duration-200"
                      >
                        <span>Email</span>
                        {sortBy === 'email' && (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">
                      <button
                        onClick={() => handleSort('role')}
                        className="flex items-center space-x-1 hover:text-primary transition-colors duration-200"
                      >
                        <span>Role</span>
                        {sortBy === 'role' && (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">Stats</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center space-x-1 hover:text-primary transition-colors duration-200"
                      >
                        <span>Joined</span>
                        {sortBy === 'createdAt' && (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-dark-gray">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-medium-gray hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-secondary">{user.name}</div>
                            {user.lastLogin && (
                              <div className="text-xs text-dark-gray">
                                Last login: {new Date(user.lastLogin).toLocaleDateString('en-BD')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-dark-gray">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-dark-gray">{user.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            <span className="capitalize">{user.role}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-dark-gray">
                          <div className="flex items-center space-x-1">
                            <Package className="h-3 w-3" />
                            <span>{user.stats?.totalOrders || 0} orders</span>
                          </div>
                          <div className="font-medium text-primary">
                            ৳{user.stats?.totalSpent?.toLocaleString('en-BD') || 0}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-dark-gray">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(user.createdAt).toLocaleDateString('en-BD')}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/admin/users/${user._id}/orders`}
                            className="p-2 text-primary hover:text-primary-dark hover:bg-primary/10 rounded-lg transition-colors duration-200"
                            title="View Orders"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {/* Role Dropdown */}
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            disabled={updatingRole === user._id}
                            className="px-2 py-1 text-xs border border-medium-gray rounded focus:ring-primary focus:border-primary disabled:opacity-50"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            disabled={deletingUser === user._id || user.role === 'admin'}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete User"
                          >
                            {deletingUser === user._id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-medium-gray p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                  <div className="text-sm text-dark-gray">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalUsers)} of {totalUsers} users
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPrev}
                      className={`p-2 rounded-lg transition-colors duration-200 ${hasPrev
                        ? 'text-primary hover:bg-primary/10'
                        : 'text-gray-300 cursor-not-allowed'
                        }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors duration-200 ${currentPage === pageNum
                              ? 'bg-primary text-white'
                              : 'text-dark-gray hover:bg-gray-100'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNext}
                      className={`p-2 rounded-lg transition-colors duration-200 ${hasNext
                        ? 'text-primary hover:bg-primary/10'
                        : 'text-gray-300 cursor-not-allowed'
                        }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
