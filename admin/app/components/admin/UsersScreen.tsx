"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Edit,
  X,
  Save,
} from "lucide-react";
import { debounce } from "lodash";

import apiClient from "@/app/lib/api-client";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isBlocked: boolean;
  profileImage?: string;
  createdAt: string;
}

export interface UsersResponse {
  data: AdminUser[];
  totalPages: number;
}

export default function UsersScreen({
  initialUsers,
  initialTotalPages,
}: {
  initialUsers: AdminUser[];
  initialTotalPages: number;
}) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [limit] = useState(10);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchUsers = useCallback(
    async (currentSearch: string, currentPage: number) => {
      setLoading(true);
      try {
        const { data } = await apiClient.get<UsersResponse>("/users/admin/all", {
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

  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setPage(1);
        fetchUsers(query, 1);
      }, 500),
    [fetchUsers],
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  useEffect(() => {
    if (page === 1 && search === "") {
      return;
    }

    fetchUsers(search, page);
  }, [fetchUsers, page, search]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    debouncedSearch(event.target.value);
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUser) return;
    setUpdateLoading(true);
    try {
      await apiClient.patch(`/users/admin/update/${selectedUser._id}`, selectedUser);
      setUsers((previous) =>
        previous.map((user) =>
          user._id === selectedUser._id ? selectedUser : user,
        ),
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
      setUsers((previous) =>
        previous.map((user) =>
          user._id === userId ? { ...user, isBlocked: !currentStatus } : user,
        ),
      );
    } catch (error) {
      alert("Status update failed");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure? This action is permanent.")) return;
    try {
      await apiClient.delete(`/users/admin/delete/${userId}`);
      setUsers((previous) => previous.filter((user) => user._id !== userId));
    } catch (error) {
      alert("Delete failed");
    }
  };

  return (
    <div className="relative space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage platform members
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 outline-none"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/50">
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
                <th className="p-4 text-right text-xs font-black uppercase text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="p-4" colSpan={5}>
                      <div className="h-12 animate-pulse rounded-xl bg-muted/50" />
                    </td>
                  </tr>
                ))
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
                          }
                          className="h-10 w-10 rounded-full"
                          alt=""
                        />
                        <p className="text-sm font-bold">{user.name}</p>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                        <span>{user.phone}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-bold uppercase italic text-primary">
                      {user.role}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                        className={`rounded-full border px-3 py-1 text-[10px] font-bold ${
                          user.isBlocked
                            ? "border-red-500/20 bg-red-500/10 text-red-600"
                            : "border-green-500/20 bg-green-500/10 text-green-600"
                        }`}
                      >
                        {user.isBlocked ? "BLOCKED" : "ACTIVE"}
                      </button>
                    </td>
                    <td className="flex justify-end gap-2 p-4 text-right">
                      <button
                        onClick={() => openEditModal(user)}
                        className="rounded-lg p-2 text-primary transition-all hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="rounded-lg p-2 text-red-500 transition-all hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((currentPage) => currentPage - 1)}
            className="rounded-lg border border-border bg-card p-2 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span>Page {page}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              of
            </span>
            <span>{totalPages}</span>
          </div>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((currentPage) => currentPage + 1)}
            className="rounded-lg border border-border bg-card p-2 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex h-full w-full max-w-md animate-in flex-col border-l border-border bg-card p-6 shadow-2xl slide-in-from-right duration-300">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-black italic">EDIT USER</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full p-2 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateUser}
              className="flex-1 space-y-5 overflow-y-auto pr-2"
            >
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-border bg-muted/50 p-3 outline-none focus:ring-2 focus:ring-primary"
                  value={selectedUser.name}
                  onChange={(event) =>
                    setSelectedUser({ ...selectedUser, name: event.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-border bg-muted/50 p-3 outline-none focus:ring-2 focus:ring-primary"
                  value={selectedUser.email}
                  onChange={(event) =>
                    setSelectedUser({ ...selectedUser, email: event.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-border bg-muted/50 p-3 outline-none focus:ring-2 focus:ring-primary"
                  value={selectedUser.phone}
                  onChange={(event) =>
                    setSelectedUser({ ...selectedUser, phone: event.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">
                  System Role
                </label>
                <select
                  className="w-full rounded-xl border border-border bg-muted/50 p-3 outline-none focus:ring-2 focus:ring-primary"
                  value={selectedUser.role}
                  onChange={(event) =>
                    setSelectedUser({ ...selectedUser, role: event.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="agency">Agency</option>
                  <option value="renter">Renter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </form>

            <div className="mt-auto border-t border-border pt-6">
              <button
                disabled={updateLoading}
                onClick={handleUpdateUser}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-black text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {updateLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" /> SAVE CHANGES
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
