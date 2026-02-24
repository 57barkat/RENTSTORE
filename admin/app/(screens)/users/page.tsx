"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Edit,
  X,
  Save,
} from "lucide-react";
import apiClient from "@/app/lib/api-client";
import { debounce } from "lodash";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isBlocked: boolean;
  profileImage?: string;
  createdAt: string;
}

const UsersAdmin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchUsers = useCallback(
    async (currentSearch: string, currentPage: number) => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/users/admin/all`, {
          params: { search: currentSearch, page: currentPage, limit },
        });
        setUsers(data.data);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setPage(1);
      fetchUsers(query, 1);
    }, 500),
    [],
  );

  useEffect(() => {
    fetchUsers(search, page);
  }, [page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Logic to Open Edit Modal
  const openEditModal = (user: User) => {
    setSelectedUser({ ...user });
    setIsEditModalOpen(true);
  };

  // Handle Full Update
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setUpdateLoading(true);
    try {
      await apiClient.patch(
        `/users/admin/update/${selectedUser._id}`,
        selectedUser,
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUser._id ? selectedUser : u)),
      );
      setIsEditModalOpen(false);
    } catch (error) {
      alert("Failed to update user details");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/users/admin/update/${userId}`, {
        isBlocked: !currentStatus,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isBlocked: !currentStatus } : u,
        ),
      );
    } catch (error) {
      alert("Status update failed");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure? This action is permanent.")) return;
    try {
      await apiClient.delete(`/users/admin/delete/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            User Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Review and manage platform members
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl outline-none"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 text-xs font-black uppercase text-muted-foreground">
                  User
                </th>
                <th className="p-4 text-xs font-black uppercase text-muted-foreground">
                  Contact
                </th>
                <th className="p-4 text-xs font-black uppercase text-muted-foreground">
                  Role
                </th>
                <th className="p-4 text-xs font-black uppercase text-muted-foreground">
                  Status
                </th>
                <th className="p-4 text-xs font-black uppercase text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          user.profileImage ||
                          `https://ui-avatars.com/api/?name=${user.name}`
                        }
                        className="w-10 h-10 rounded-full"
                        alt=""
                      />
                      <p className="font-bold text-sm">{user.name}</p>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    <div className="flex flex-col">
                      <span>{user.email}</span>
                      <span>{user.phone}</span>
                    </div>
                  </td>
                  <td className="p-4 italic text-xs uppercase font-bold text-primary">
                    {user.role}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() =>
                        handleToggleBlock(user._id, user.isBlocked)
                      }
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                        user.isBlocked
                          ? "bg-red-500/10 text-red-600 border-red-500/20"
                          : "bg-green-500/10 text-green-600 border-green-500/20"
                      }`}
                    >
                      {user.isBlocked ? "BLOCKED" : "ACTIVE"}
                    </button>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL / DRAWER */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md h-full bg-card border-l border-border shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black italic">EDIT USER</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-muted rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateUser}
              className="space-y-5 flex-1 overflow-y-auto pr-2"
            >
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  value={selectedUser.name}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full p-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  value={selectedUser.phone}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, phone: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">
                  System Role
                </label>
                <select
                  className="w-full p-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="agency">Agency</option>
                  <option value="renter">Renter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </form>

            <div className="pt-6 border-t border-border mt-auto">
              <button
                disabled={updateLoading}
                onClick={handleUpdateUser}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {updateLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4" /> SAVE CHANGES
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAdmin;
