"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  Heart,
  Headphones,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  UserCircle2,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

import { PublicAccountNavItems } from "@/app/components/public/PublicAccountNavigation";
import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";
import {
  PUBLIC_CATEGORY_LINKS,
  getPublicCategoryFromPath,
  isPublicAccountRoute,
} from "@/app/lib/route-constants";

function matchesRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function drawerLinkClass(active: boolean, primary = false) {
  if (primary) {
    return "bg-[#000080] text-white shadow-[0_16px_32px_-26px_rgba(0,0,128,0.65)] hover:opacity-95";
  }

  if (active) {
    return "bg-[#000080] text-white shadow-[0_16px_32px_-26px_rgba(0,0,128,0.65)]";
  }

  return "bg-[var(--admin-card)] text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[#000080]";
}

function MobileDrawerLink({
  href,
  active,
  children,
  icon: Icon,
  onNavigate,
  primary = false,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
  icon?: LucideIcon;
  onNavigate: () => void;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={`inline-flex min-h-11 items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,0,128,0.22)] ${drawerLinkClass(
        active,
        primary,
      )}`}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span className="truncate">{children}</span>
    </Link>
  );
}

function MobileDrawerSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-2.5">
      <h2 className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
        {title}
      </h2>

      <div className="grid gap-2">{children}</div>
    </section>
  );
}

function ProfileMenuLink({
  href,
  icon: Icon,
  label,
  description,
  active,
  onClick,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className={`group flex items-start gap-3 rounded-2xl px-3 py-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary)]/10 ${
        active
          ? "bg-[var(--admin-primary)] text-white"
          : "text-[var(--admin-text)] hover:bg-[var(--admin-background)]"
      }`}
    >
      <span
        className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          active
            ? "bg-white/15 text-white"
            : "bg-[var(--admin-background)] text-[var(--admin-primary)] group-hover:bg-white"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0">
        <span className="block text-sm font-bold">{label}</span>
        <span
          className={`mt-0.5 block text-xs leading-5 ${
            active ? "text-white/75" : "text-[var(--admin-muted)]"
          }`}
        >
          {description}
        </span>
      </span>
    </Link>
  );
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function PublicHeader() {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const drawerCloseButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const activeCategory = getPublicCategoryFromPath(pathname);
  const isAccountArea = isPublicAccountRoute(pathname);
  const mobileMenuVisibilityClass = isAccountArea ? "lg:hidden" : "xl:hidden";
  const { isAuthenticated, isLoading, logout, user } = usePublicAuth();

  const closeMobileMenu = () => setMobileOpen(false);
  const closeProfileMenu = () => setProfileOpen(false);

  const firstName =
    user?.name?.trim()?.split(/\s+/)?.[0] ||
    user?.email?.split("@")?.[0] ||
    "Account";

  useEffect(() => {
    if (!mobileOpen || !mounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen, mounted]);

  useEffect(() => {
    if (!mobileOpen || !mounted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, mounted]);

  useEffect(() => {
    if (!profileOpen || !mounted) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (
        profileMenuRef.current?.contains(target) ||
        profileButtonRef.current?.contains(target)
      ) {
        return;
      }

      setProfileOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        profileButtonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen, mounted]);

  useEffect(() => {
    if (!mobileOpen || !mounted) return;

    drawerCloseButtonRef.current?.focus();

    const mediaQuery = window.matchMedia(
      isAccountArea ? "(min-width: 1024px)" : "(min-width: 1280px)",
    );

    const closeIfDesktop = () => {
      if (mediaQuery.matches) setMobileOpen(false);
    };

    closeIfDesktop();
    mediaQuery.addEventListener("change", closeIfDesktop);

    return () => mediaQuery.removeEventListener("change", closeIfDesktop);
  }, [isAccountArea, mobileOpen, mounted]);

  const mobileDrawer = mounted ? (
    <div
      className={`fixed inset-0 z-[1000] transition-[visibility] duration-200 ${mobileMenuVisibilityClass} ${
        mobileOpen
          ? "visible pointer-events-auto"
          : "invisible pointer-events-none"
      }`}
      aria-hidden={!mobileOpen}
    >
      <button
        type="button"
        aria-label="Close navigation overlay"
        tabIndex={-1}
        onClick={closeMobileMenu}
        className={`absolute inset-0 h-full w-full bg-slate-950/55 backdrop-blur-[2px] transition-opacity duration-200 ${
          mobileOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        id="public-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="public-mobile-drawer-title"
        className={`relative z-10 flex h-dvh w-[82vw] max-w-[320px] flex-col overflow-hidden border-r border-[var(--admin-border)] bg-white shadow-[24px_0_60px_-36px_rgba(15,23,42,0.55)] transition-transform duration-200 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--admin-border)] px-4 py-3.5">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="inline-flex min-w-0 items-center gap-3 text-[var(--admin-text)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#000080] text-white">
              <Building2 size={19} />
            </span>

            <span className="min-w-0">
              <span
                id="public-mobile-drawer-title"
                className="block truncate text-base font-black tracking-tight"
              >
                AnganStay
              </span>

              <span className="mt-1 block truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                Verified Rentals
              </span>
            </span>
          </Link>

          <button
            type="button"
            ref={drawerCloseButtonRef}
            aria-label="Close navigation"
            onClick={closeMobileMenu}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-muted)] transition hover:border-[#000080] hover:text-[#000080]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid gap-5">
            <MobileDrawerSection title="Primary actions">
              <MobileDrawerLink
                href="/"
                active={pathname === "/"}
                icon={Search}
                onNavigate={closeMobileMenu}
              >
                Browse All Properties
              </MobileDrawerLink>

              {!isLoading && isAuthenticated ? (
                <MobileDrawerLink
                  href="/upload-property"
                  active={matchesRoute(pathname, "/upload-property")}
                  icon={Plus}
                  onNavigate={closeMobileMenu}
                  primary
                >
                  Upload Property
                </MobileDrawerLink>
              ) : null}
            </MobileDrawerSection>

            {!isLoading && (
              <MobileDrawerSection title="Account">
                {isAuthenticated ? (
                  <>
                    <PublicAccountNavItems
                      pathname={pathname}
                      onNavigate={closeMobileMenu}
                      surface
                    />

                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        void logout();
                      }}
                      className="inline-flex min-h-11 items-center gap-3 rounded-2xl bg-[var(--admin-card)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-muted)] transition hover:bg-[var(--admin-surface)] hover:text-[#000080]"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <MobileDrawerLink
                      href="/account/login"
                      active={matchesRoute(pathname, "/account/login")}
                      icon={UserCircle2}
                      onNavigate={closeMobileMenu}
                    >
                      Login
                    </MobileDrawerLink>

                    <MobileDrawerLink
                      href="/account/signup"
                      active={matchesRoute(pathname, "/account/signup")}
                      onNavigate={closeMobileMenu}
                      primary
                    >
                      Sign up
                    </MobileDrawerLink>
                  </>
                )}
              </MobileDrawerSection>
            )}

            <MobileDrawerSection title="Explore">
              <div className="grid grid-cols-2 gap-2">
                {PUBLIC_CATEGORY_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`inline-flex min-h-10 items-center justify-center rounded-2xl px-3 py-2 text-center text-sm font-semibold transition ${drawerLinkClass(
                      activeCategory === item.category,
                    )}`}
                  >
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </MobileDrawerSection>
          </div>
        </div>
      </aside>
    </div>
  ) : null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[color:color-mix(in_srgb,var(--admin-border)_86%,transparent)] bg-[rgba(255,255,255,0.94)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-[var(--admin-text)] transition hover:text-[var(--admin-primary)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-primary)] text-white shadow-[0_18px_30px_-18px_var(--admin-primary)]">
                <Building2 size={20} />
              </span>

              <span className="flex flex-col leading-none">
                <span className="text-lg font-semibold tracking-tight">
                  AnganStay
                </span>

                <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                  Verified Rentals
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 xl:flex">
              {PUBLIC_CATEGORY_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                    activeCategory === item.category
                      ? "bg-[var(--admin-primary)] text-white shadow-[0_18px_40px_-24px_var(--admin-primary-strong)]"
                      : "text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] lg:inline-flex"
            >
              <Search size={16} />
              All Properties
            </Link>

            {!isLoading && isAuthenticated ? (
              <>
                <Link
                  href="/upload-property"
                  className="hidden items-center gap-2 rounded-full bg-[var(--admin-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_var(--admin-primary)] transition hover:opacity-95 lg:inline-flex"
                >
                  <Plus size={16} />
                  Upload Property
                </Link>

                <div className="relative hidden lg:block">
                  <button
                    ref={profileButtonRef}
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                    onClick={() => setProfileOpen((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary)]/10"
                  >
                    <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                      {user?.profileImage ? (
                        <Image
                          src={user.profileImage}
                          alt={user.name || "Account"}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : (
                        <UserCircle2 className="h-5 w-5" />
                      )}
                    </span>

                    <span className="max-w-[120px] truncate">{firstName}</span>

                    <ChevronDown
                      className={`h-4 w-4 text-[var(--admin-muted)] transition ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {profileOpen ? (
                    <div
                      ref={profileMenuRef}
                      role="menu"
                      aria-label="Account menu"
                      className="absolute right-0 top-[calc(100%+0.75rem)] z-[80] w-[310px] overflow-hidden rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-2 shadow-[0_24px_70px_-38px_var(--admin-shadow)]"
                    >
                      <div className="border-b border-[var(--admin-border)] px-3 py-3">
                        <p className="truncate text-sm font-black text-[var(--admin-text)]">
                          {user?.name || "Your account"}
                        </p>

                        {user?.email ? (
                          <p className="mt-1 truncate text-xs text-[var(--admin-muted)]">
                            {user.email}
                          </p>
                        ) : null}
                      </div>

                      <div className="grid gap-1 py-2">
                        <ProfileMenuLink
                          href="/account/dashboard"
                          icon={LayoutDashboard}
                          label="Dashboard"
                          description="View account overview"
                          active={matchesRoute(pathname, "/account/dashboard")}
                          onClick={closeProfileMenu}
                        />

                        <ProfileMenuLink
                          href="/account/properties"
                          icon={Home}
                          label="My Properties"
                          description="Manage listings and drafts"
                          active={matchesRoute(pathname, "/account/properties")}
                          onClick={closeProfileMenu}
                        />

                        <ProfileMenuLink
                          href="/account/favorites"
                          icon={Heart}
                          label="Favorites"
                          description="Open saved listings"
                          active={matchesRoute(pathname, "/account/favorites")}
                          onClick={closeProfileMenu}
                        />

                        <ProfileMenuLink
                          href="/account/profile"
                          icon={Settings}
                          label="Settings"
                          description="Update profile and account details"
                          active={matchesRoute(pathname, "/account/profile")}
                          onClick={closeProfileMenu}
                        />

                        <ProfileMenuLink
                          href="/account/support"
                          icon={Headphones}
                          label="Support"
                          description="Get help from AnganStay support"
                          active={matchesRoute(pathname, "/account/support")}
                          onClick={closeProfileMenu}
                        />
                      </div>

                      <div className="border-t border-[var(--admin-border)] p-2">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            closeProfileMenu();
                            void logout();
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-100"
                        >
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                            <LogOut className="h-4 w-4" />
                          </span>
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            ) : !isLoading ? (
              <>
                <Link
                  href="/account/login"
                  className="hidden rounded-full border border-[var(--admin-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] lg:inline-flex"
                >
                  Login
                </Link>

                <Link
                  href="/account/signup"
                  className="hidden rounded-full bg-[var(--admin-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_var(--admin-primary)] transition hover:opacity-95 lg:inline-flex"
                >
                  Sign up
                </Link>
              </>
            ) : null}

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-icon)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] ${mobileMenuVisibilityClass} ${
                mobileOpen
                  ? "pointer-events-none opacity-0"
                  : "pointer-events-auto opacity-100"
              }`}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {mounted && createPortal(mobileDrawer, document.body)}
    </>
  );
}
