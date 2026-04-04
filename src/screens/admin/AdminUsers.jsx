import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { 
  Users, Search, Filter, 
  ChevronLeft, ChevronRight, User, 
  Mail, Phone, Shield, MoreVertical,
  Trash2, Edit2, AlertCircle
} from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleRoleUpdate = async (id, role) => {
    try {
      await axios.patch(`/api/admin/users/${id}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u._id === id ? { ...u, role } : u));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-secondary">User Management</h1>
        <p className="text-secondary/60 text-lg">Manage user accounts, roles, and permissions.</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-premium shadow-sm border border-secondary/5 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40" />
          <input 
            type="text" 
            placeholder="Search by Name or Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <button className="px-6 py-3 bg-secondary/5 text-secondary rounded-xl font-bold flex items-center gap-2 hover:bg-secondary/10 transition-all">
          <Filter className="w-5 h-5" /> Filter
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-premium shadow-sm border border-secondary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/5 text-secondary/40 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-6">User</th>
                <th className="px-8 py-6">Email</th>
                <th className="px-8 py-6">Role</th>
                <th className="px-8 py-6">Joined Date</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/5">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-secondary/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary/5 rounded-full flex items-center justify-center text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <User className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-secondary text-sm">{user.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-secondary/60">{user.email}</p>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border-none outline-none focus:ring-2 focus:ring-primary/20 ${
                        user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-secondary/60">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-secondary/20 hover:text-secondary transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-secondary/20 hover:text-error transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-20 text-center space-y-4 opacity-40">
            <Users className="w-16 h-16 mx-auto" />
            <p className="text-lg font-bold">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};
