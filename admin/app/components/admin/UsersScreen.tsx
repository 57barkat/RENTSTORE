/* eslint-disable @next/next/no-img-element */
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
import { getAvatarPlaceholder } from "@/app/lib/avatar";

const ROLE_OPTIONS = ["user", "agency", "renter", "admin", "agent"] as const;
const SUBSCRIPTION_OPTIONS = ["free", "standard", "pro"] as const;
const ACCOUNT_STATUS_OPTIONS = ["ACTIVE", "SUSPENDED", "BANNED"] as const;

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isBlocked: boolean;
  profileImage?: string;
  createdAt: string;
  cnic?: string;
  password?: string;
  resetPasswordCode?: string;
  resetPasswordCodeExpires?: string;
  isResetCodeVerified?: boolean;
  agency?: string | { _id?: string };
  subscription?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  subscriptionAutoRenew?: boolean;
  subscriptionTrialUsed?: boolean;
  propertyLimit?: number;
  paidPropertyCredits?: number;
  usedPropertyCount?: number;
  prioritySlotCredits?: number;
  paidFeaturedCredits?: number;
  agencyLicense?: string;
  preferences?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  TermsAndConditionsAccepted?: boolean;
  fcmToken?: string;
  subscriptions?: string[];
  favorites?: Array<string | { _id?: string }>;
  refreshToken?: string;
  emailVerificationCode?: string;
  emailVerificationCodeExpires?: string;
  warnings?: number;
  accountStatus?: string;
  strikeCount?: number;
  suspendedAt?: string;
  suspensionReason?: string;
  bannedAt?: string;
}

interface EditableAdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  cnic: string;
  password: string;
  resetPasswordCode: string;
  resetPasswordCodeExpires: string;
  isResetCodeVerified: boolean;
  agency: string;
  subscription: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  subscriptionAutoRenew: boolean;
  subscriptionTrialUsed: boolean;
  propertyLimit: string;
  paidPropertyCredits: string;
  usedPropertyCount: string;
  prioritySlotCredits: string;
  paidFeaturedCredits: string;
  agencyLicense: string;
  preferences: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  TermsAndConditionsAccepted: boolean;
  fcmToken: string;
  subscriptions: string[];
  favorites: string[];
  refreshToken: string;
  profileImage: string;
  emailVerificationCode: string;
  warnings: string;
  isBlocked: boolean;
  emailVerificationCodeExpires: string;
  accountStatus: string;
  strikeCount: string;
  suspendedAt: string;
  suspensionReason: string;
  bannedAt: string;
}

export interface UsersResponse {
  data: AdminUser[];
  totalPages: number;
}

const inputClassName =
  "w-full rounded-xl border border-border bg-muted/50 p-3 outline-none focus:ring-2 focus:ring-primary";

const resolveObjectId = (value?: string | { _id?: string } | null) => {
  if (!value) return "";
  return typeof value === "string" ? value : value._id || "";
};

const normalizeIdList = (
  value?: Array<string | { _id?: string }> | null,
): string[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item : item?._id || ""))
    .filter(Boolean);
};

const normalizeStringList = (value?: string[] | null): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => item.trim()).filter(Boolean);
};

const formatDateTimeLocal = (value?: string | Date | null) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const timezoneOffset = parsed.getTimezoneOffset() * 60_000;
  return new Date(parsed.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const buildEditableUser = (user: AdminUser): EditableAdminUser => ({
  _id: user._id,
  name: user.name || "",
  email: user.email || "",
  phone: user.phone || "",
  role: user.role || "user",
  cnic: user.cnic || "",
  password: "",
  resetPasswordCode: user.resetPasswordCode || "",
  resetPasswordCodeExpires: formatDateTimeLocal(user.resetPasswordCodeExpires),
  isResetCodeVerified: Boolean(user.isResetCodeVerified),
  agency: resolveObjectId(user.agency),
  subscription: user.subscription || "free",
  subscriptionStartDate: formatDateTimeLocal(user.subscriptionStartDate),
  subscriptionEndDate: formatDateTimeLocal(user.subscriptionEndDate),
  subscriptionAutoRenew: Boolean(user.subscriptionAutoRenew),
  subscriptionTrialUsed: Boolean(user.subscriptionTrialUsed),
  propertyLimit: String(user.propertyLimit ?? 0),
  paidPropertyCredits: String(user.paidPropertyCredits ?? 0),
  usedPropertyCount: String(user.usedPropertyCount ?? 0),
  prioritySlotCredits: String(user.prioritySlotCredits ?? 0),
  paidFeaturedCredits: String(user.paidFeaturedCredits ?? 0),
  agencyLicense: user.agencyLicense || "",
  preferences: user.preferences || "",
  isPhoneVerified: Boolean(user.isPhoneVerified),
  isEmailVerified: Boolean(user.isEmailVerified),
  TermsAndConditionsAccepted: Boolean(user.TermsAndConditionsAccepted),
  fcmToken: user.fcmToken || "",
  subscriptions: normalizeStringList(user.subscriptions),
  favorites: normalizeIdList(user.favorites),
  refreshToken: user.refreshToken || "",
  profileImage: user.profileImage || "",
  emailVerificationCode: user.emailVerificationCode || "",
  warnings: String(user.warnings ?? 0),
  isBlocked: Boolean(user.isBlocked),
  emailVerificationCodeExpires: formatDateTimeLocal(
    user.emailVerificationCodeExpires,
  ),
  accountStatus: user.accountStatus || "ACTIVE",
  strikeCount: String(user.strikeCount ?? 0),
  suspendedAt: formatDateTimeLocal(user.suspendedAt),
  suspensionReason: user.suspensionReason || "",
  bannedAt: formatDateTimeLocal(user.bannedAt),
});

const parseListInput = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const toNullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const toIsoStringOrNull = (value: string) =>
  value ? new Date(value).toISOString() : null;

const toNumberValue = (value: string) => {
  const normalized = value.trim();
  return normalized === "" ? 0 : Number(normalized);
};

interface FieldShellProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function FieldShell({ label, description, children }: FieldShellProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase text-muted-foreground">
        {label}
      </label>
      {children}
      {description ? (
        <p className="text-[11px] text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

interface SectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
      <div>
        <h3 className="text-sm font-black uppercase tracking-wide">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-primary"
      />
    </label>
  );
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
  const [selectedUser, setSelectedUser] = useState<EditableAdminUser | null>(null);
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
      } catch {
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

  const updateSelectedUser = <K extends keyof EditableAdminUser>(
    key: K,
    value: EditableAdminUser[K],
  ) => {
    setSelectedUser((current) => (current ? { ...current, [key]: value } : current));
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(buildEditableUser(user));
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUser) return;

    const payload = {
      name: selectedUser.name.trim(),
      email: selectedUser.email.trim(),
      phone: selectedUser.phone.trim(),
      role: selectedUser.role,
      cnic: selectedUser.cnic.trim(),
      password: selectedUser.password.trim() || undefined,
      resetPasswordCode: toNullableString(selectedUser.resetPasswordCode),
      resetPasswordCodeExpires: toIsoStringOrNull(
        selectedUser.resetPasswordCodeExpires,
      ),
      isResetCodeVerified: selectedUser.isResetCodeVerified,
      agency: toNullableString(selectedUser.agency),
      subscription: selectedUser.subscription,
      subscriptionStartDate: toIsoStringOrNull(selectedUser.subscriptionStartDate),
      subscriptionEndDate: toIsoStringOrNull(selectedUser.subscriptionEndDate),
      subscriptionAutoRenew: selectedUser.subscriptionAutoRenew,
      subscriptionTrialUsed: selectedUser.subscriptionTrialUsed,
      propertyLimit: toNumberValue(selectedUser.propertyLimit),
      paidPropertyCredits: toNumberValue(selectedUser.paidPropertyCredits),
      usedPropertyCount: toNumberValue(selectedUser.usedPropertyCount),
      prioritySlotCredits: toNumberValue(selectedUser.prioritySlotCredits),
      paidFeaturedCredits: toNumberValue(selectedUser.paidFeaturedCredits),
      agencyLicense: toNullableString(selectedUser.agencyLicense),
      preferences: toNullableString(selectedUser.preferences),
      isPhoneVerified: selectedUser.isPhoneVerified,
      isEmailVerified: selectedUser.isEmailVerified,
      TermsAndConditionsAccepted: selectedUser.TermsAndConditionsAccepted,
      fcmToken: toNullableString(selectedUser.fcmToken),
      subscriptions: selectedUser.subscriptions,
      favorites: selectedUser.favorites,
      refreshToken: toNullableString(selectedUser.refreshToken),
      profileImage: toNullableString(selectedUser.profileImage),
      emailVerificationCode: toNullableString(selectedUser.emailVerificationCode),
      warnings: toNumberValue(selectedUser.warnings),
      isBlocked: selectedUser.isBlocked,
      emailVerificationCodeExpires: toIsoStringOrNull(
        selectedUser.emailVerificationCodeExpires,
      ),
      accountStatus: selectedUser.accountStatus,
      strikeCount: toNumberValue(selectedUser.strikeCount),
      suspendedAt: toIsoStringOrNull(selectedUser.suspendedAt),
      suspensionReason: toNullableString(selectedUser.suspensionReason),
      bannedAt: toIsoStringOrNull(selectedUser.bannedAt),
    };

    setUpdateLoading(true);
    try {
      await apiClient.patch(`/users/admin/update/${selectedUser._id}`, payload);
      setUsers((previous) =>
        previous.map((user) =>
          user._id === selectedUser._id
            ? {
                ...user,
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                role: payload.role,
                isBlocked: payload.isBlocked,
                profileImage: payload.profileImage || undefined,
                cnic: payload.cnic || undefined,
                resetPasswordCode: payload.resetPasswordCode ?? undefined,
                resetPasswordCodeExpires:
                  payload.resetPasswordCodeExpires ?? undefined,
                isResetCodeVerified: payload.isResetCodeVerified,
                agency: payload.agency ?? undefined,
                subscription: payload.subscription,
                subscriptionStartDate:
                  payload.subscriptionStartDate ?? undefined,
                subscriptionEndDate: payload.subscriptionEndDate ?? undefined,
                subscriptionAutoRenew: payload.subscriptionAutoRenew,
                subscriptionTrialUsed: payload.subscriptionTrialUsed,
                propertyLimit: payload.propertyLimit,
                paidPropertyCredits: payload.paidPropertyCredits,
                usedPropertyCount: payload.usedPropertyCount,
                prioritySlotCredits: payload.prioritySlotCredits,
                paidFeaturedCredits: payload.paidFeaturedCredits,
                agencyLicense: payload.agencyLicense ?? undefined,
                preferences: payload.preferences ?? undefined,
                isPhoneVerified: payload.isPhoneVerified,
                isEmailVerified: payload.isEmailVerified,
                TermsAndConditionsAccepted:
                  payload.TermsAndConditionsAccepted,
                fcmToken: payload.fcmToken ?? undefined,
                subscriptions: payload.subscriptions,
                favorites: payload.favorites,
                refreshToken: payload.refreshToken ?? undefined,
                emailVerificationCode:
                  payload.emailVerificationCode ?? undefined,
                warnings: payload.warnings,
                emailVerificationCodeExpires:
                  payload.emailVerificationCodeExpires ?? undefined,
                accountStatus: payload.accountStatus,
                strikeCount: payload.strikeCount,
                suspendedAt: payload.suspendedAt ?? undefined,
                suspensionReason: payload.suspensionReason ?? undefined,
                bannedAt: payload.bannedAt ?? undefined,
              }
            : user,
        ),
      );
      closeEditModal();
    } catch {
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
    } catch {
      alert("Status update failed");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure? This action is permanent.")) return;
    try {
      await apiClient.delete(`/users/admin/delete/${userId}`);
      setUsers((previous) => previous.filter((user) => user._id !== userId));
    } catch {
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
                            user.profileImage || getAvatarPlaceholder(user.name)
                          }
                          className="h-10 w-10 rounded-full"
                          alt=""
                        />
                        <div>
                          <p className="text-sm font-bold">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.accountStatus || "ACTIVE"}
                          </p>
                        </div>
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
          <div className="flex h-full w-full max-w-3xl animate-in flex-col border-l border-border bg-card p-6 shadow-2xl slide-in-from-right duration-300">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black italic">EDIT USER</h2>
                <p className="text-sm text-muted-foreground">
                  Admin-level editor for the user schema
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="rounded-full p-2 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              id="admin-user-form"
              onSubmit={handleUpdateUser}
              className="flex-1 space-y-5 overflow-y-auto pr-2"
            >
              <Section
                title="Identity"
                description="Primary profile and login identity fields."
              >
                <FieldShell label="Full Name">
                  <input
                    type="text"
                    className={inputClassName}
                    value={selectedUser.name}
                    onChange={(event) =>
                      updateSelectedUser("name", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="Email Address">
                  <input
                    type="email"
                    className={inputClassName}
                    value={selectedUser.email}
                    onChange={(event) =>
                      updateSelectedUser("email", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="Phone Number">
                  <input
                    type="text"
                    className={inputClassName}
                    value={selectedUser.phone}
                    onChange={(event) =>
                      updateSelectedUser("phone", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="CNIC">
                  <input
                    type="text"
                    className={inputClassName}
                    value={selectedUser.cnic}
                    onChange={(event) =>
                      updateSelectedUser("cnic", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell
                  label="New Password"
                  description="Leave blank if you do not want to change the current password."
                >
                  <input
                    type="password"
                    className={inputClassName}
                    value={selectedUser.password}
                    onChange={(event) =>
                      updateSelectedUser("password", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="Profile Image URL">
                  <input
                    type="text"
                    className={inputClassName}
                    value={selectedUser.profileImage}
                    onChange={(event) =>
                      updateSelectedUser("profileImage", event.target.value)
                    }
                  />
                </FieldShell>
              </Section>

              <Section
                title="Permissions"
                description="Role, account state, and moderation controls."
              >
                <FieldShell label="System Role">
                  <select
                    className={inputClassName}
                    value={selectedUser.role}
                    onChange={(event) =>
                      updateSelectedUser("role", event.target.value)
                    }
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </FieldShell>

                <FieldShell label="Account Status">
                  <select
                    className={inputClassName}
                    value={selectedUser.accountStatus}
                    onChange={(event) =>
                      updateSelectedUser("accountStatus", event.target.value)
                    }
                  >
                    {ACCOUNT_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </FieldShell>

                <FieldShell label="Warnings">
                  <input
                    type="number"
                    className={inputClassName}
                    value={selectedUser.warnings}
                    onChange={(event) =>
                      updateSelectedUser("warnings", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="Strike Count">
                  <input
                    type="number"
                    className={inputClassName}
                    value={selectedUser.strikeCount}
                    onChange={(event) =>
                      updateSelectedUser("strikeCount", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="Suspended At">
                  <input
                    type="datetime-local"
                    className={inputClassName}
                    value={selectedUser.suspendedAt}
                    onChange={(event) =>
                      updateSelectedUser("suspendedAt", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="Banned At">
                  <input
                    type="datetime-local"
                    className={inputClassName}
                    value={selectedUser.bannedAt}
                    onChange={(event) =>
                      updateSelectedUser("bannedAt", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="Suspension Reason">
                  <textarea
                    className={`${inputClassName} min-h-24`}
                    value={selectedUser.suspensionReason}
                    onChange={(event) =>
                      updateSelectedUser("suspensionReason", event.target.value)
                    }
                  />
                </FieldShell>

                <CheckboxField
                  label="Blocked"
                  checked={selectedUser.isBlocked}
                  onChange={(checked) => updateSelectedUser("isBlocked", checked)}
                />
              </Section>

              <Section
                title="Subscription And Credits"
                description="Manage package lifecycle, limits, and paid balances."
              >
                <FieldShell label="Subscription">
                  <select
                    className={inputClassName}
                    value={selectedUser.subscription}
                    onChange={(event) =>
                      updateSelectedUser("subscription", event.target.value)
                    }
                  >
                    {SUBSCRIPTION_OPTIONS.map((subscription) => (
                      <option key={subscription} value={subscription}>
                        {subscription}
                      </option>
                    ))}
                  </select>
                </FieldShell>

                <FieldShell label="Subscription Start">
                  <input
                    type="datetime-local"
                    className={inputClassName}
                    value={selectedUser.subscriptionStartDate}
                    onChange={(event) =>
                      updateSelectedUser(
                        "subscriptionStartDate",
                        event.target.value,
                      )
                    }
                  />
                </FieldShell>

                <FieldShell label="Subscription End">
                  <input
                    type="datetime-local"
                    className={inputClassName}
                    value={selectedUser.subscriptionEndDate}
                    onChange={(event) =>
                      updateSelectedUser("subscriptionEndDate", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="Property Limit">
                  <input
                    type="number"
                    className={inputClassName}
                    value={selectedUser.propertyLimit}
                    onChange={(event) =>
                      updateSelectedUser("propertyLimit", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="Paid Property Credits">
                  <input
                    type="number"
                    className={inputClassName}
                    value={selectedUser.paidPropertyCredits}
                    onChange={(event) =>
                      updateSelectedUser(
                        "paidPropertyCredits",
                        event.target.value,
                      )
                    }
                  />
                </FieldShell>

                <FieldShell label="Used Property Count">
                  <input
                    type="number"
                    className={inputClassName}
                    value={selectedUser.usedPropertyCount}
                    onChange={(event) =>
                      updateSelectedUser("usedPropertyCount", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="Priority Slot Credits">
                  <input
                    type="number"
                    className={inputClassName}
                    value={selectedUser.prioritySlotCredits}
                    onChange={(event) =>
                      updateSelectedUser(
                        "prioritySlotCredits",
                        event.target.value,
                      )
                    }
                  />
                </FieldShell>

                <FieldShell label="Featured Credits">
                  <input
                    type="number"
                    className={inputClassName}
                    value={selectedUser.paidFeaturedCredits}
                    onChange={(event) =>
                      updateSelectedUser(
                        "paidFeaturedCredits",
                        event.target.value,
                      )
                    }
                  />
                </FieldShell>

                <CheckboxField
                  label="Subscription Auto Renew"
                  checked={selectedUser.subscriptionAutoRenew}
                  onChange={(checked) =>
                    updateSelectedUser("subscriptionAutoRenew", checked)
                  }
                />

                <CheckboxField
                  label="Subscription Trial Used"
                  checked={selectedUser.subscriptionTrialUsed}
                  onChange={(checked) =>
                    updateSelectedUser("subscriptionTrialUsed", checked)
                  }
                />
              </Section>

              <Section
                title="Verification"
                description="Contact verification and recovery/code fields."
              >
                <FieldShell label="Reset Password Code">
                  <input
                    type="text"
                    className={inputClassName}
                    value={selectedUser.resetPasswordCode}
                    onChange={(event) =>
                      updateSelectedUser("resetPasswordCode", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="Reset Code Expires">
                  <input
                    type="datetime-local"
                    className={inputClassName}
                    value={selectedUser.resetPasswordCodeExpires}
                    onChange={(event) =>
                      updateSelectedUser(
                        "resetPasswordCodeExpires",
                        event.target.value,
                      )
                    }
                  />
                </FieldShell>

                <FieldShell label="Email Verification Code">
                  <input
                    type="text"
                    className={inputClassName}
                    value={selectedUser.emailVerificationCode}
                    onChange={(event) =>
                      updateSelectedUser(
                        "emailVerificationCode",
                        event.target.value,
                      )
                    }
                  />
                </FieldShell>

                <FieldShell label="Email Code Expires">
                  <input
                    type="datetime-local"
                    className={inputClassName}
                    value={selectedUser.emailVerificationCodeExpires}
                    onChange={(event) =>
                      updateSelectedUser(
                        "emailVerificationCodeExpires",
                        event.target.value,
                      )
                    }
                  />
                </FieldShell>

                <CheckboxField
                  label="Reset Code Verified"
                  checked={selectedUser.isResetCodeVerified}
                  onChange={(checked) =>
                    updateSelectedUser("isResetCodeVerified", checked)
                  }
                />

                <CheckboxField
                  label="Phone Verified"
                  checked={selectedUser.isPhoneVerified}
                  onChange={(checked) =>
                    updateSelectedUser("isPhoneVerified", checked)
                  }
                />

                <CheckboxField
                  label="Email Verified"
                  checked={selectedUser.isEmailVerified}
                  onChange={(checked) =>
                    updateSelectedUser("isEmailVerified", checked)
                  }
                />

                <CheckboxField
                  label="Terms Accepted"
                  checked={selectedUser.TermsAndConditionsAccepted}
                  onChange={(checked) =>
                    updateSelectedUser("TermsAndConditionsAccepted", checked)
                  }
                />
              </Section>

              <Section
                title="Agency And Metadata"
                description="Agency linkage, preferences, and device/session values."
              >
                <FieldShell label="Agency Id">
                  <input
                    type="text"
                    className={inputClassName}
                    value={selectedUser.agency}
                    onChange={(event) =>
                      updateSelectedUser("agency", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="Agency License">
                  <input
                    type="text"
                    className={inputClassName}
                    value={selectedUser.agencyLicense}
                    onChange={(event) =>
                      updateSelectedUser("agencyLicense", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="Preferences">
                  <textarea
                    className={`${inputClassName} min-h-24`}
                    value={selectedUser.preferences}
                    onChange={(event) =>
                      updateSelectedUser("preferences", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="FCM Token">
                  <textarea
                    className={`${inputClassName} min-h-24`}
                    value={selectedUser.fcmToken}
                    onChange={(event) =>
                      updateSelectedUser("fcmToken", event.target.value)
                    }
                  />
                </FieldShell>

                <FieldShell label="Refresh Token">
                  <textarea
                    className={`${inputClassName} min-h-24`}
                    value={selectedUser.refreshToken}
                    onChange={(event) =>
                      updateSelectedUser("refreshToken", event.target.value)
                    }
                  />
                </FieldShell>
              </Section>

              <Section
                title="Collections"
                description="Edit array fields as newline or comma separated values."
              >
                <FieldShell label="Subscriptions">
                  <textarea
                    className={`${inputClassName} min-h-24`}
                    value={selectedUser.subscriptions.join("\n")}
                    onChange={(event) =>
                      updateSelectedUser(
                        "subscriptions",
                        parseListInput(event.target.value),
                      )
                    }
                  />
                </FieldShell>

                <FieldShell label="Favorite Property Ids">
                  <textarea
                    className={`${inputClassName} min-h-24`}
                    value={selectedUser.favorites.join("\n")}
                    onChange={(event) =>
                      updateSelectedUser(
                        "favorites",
                        parseListInput(event.target.value),
                      )
                    }
                  />
                </FieldShell>
              </Section>
            </form>

            <div className="mt-auto border-t border-border pt-6">
              <button
                disabled={updateLoading}
                type="submit"
                form="admin-user-form"
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
