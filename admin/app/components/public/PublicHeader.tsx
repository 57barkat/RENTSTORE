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
  UserCircle2,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

import { PublicAccountNavItems } from "@/app/components/public/PublicAccountNavigation";
import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";
import { usePublicScrollHeader } from "@/app/components/public/PublicScrollHeaderContext";
import ThemeToggle from "@/app/components/theme-toggle";
import {
  PUBLIC_CATEGORY_LINKS,
  getPublicCategoryFromPath,
  isPublicPropertyDetailPath,
  isPublicAccountRoute,
} from "@/app/lib/route-constants";
import type { PropertyCategory } from "@/app/lib/property-types";

function matchesRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function drawerLinkClass(active: boolean, primary = false) {
  if (primary) {
    return "bg-[var(--admin-primary)] text-white shadow-[0_16px_32px_-26px_var(--admin-primary-strong)] hover:opacity-95";
  }

  if (active) {
    return "bg-[var(--admin-primary)] text-white shadow-[0_16px_32px_-26px_var(--admin-primary-strong)]";
  }

  return "bg-[var(--admin-card)] text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-primary)]";
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
            : "bg-[var(--admin-background)] text-[var(--admin-primary)] group-hover:bg-[var(--admin-card)]"
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
const STICKY_FILTERS_PAGE_SELECTOR = ".has-sticky-filters";
const STICKY_FILTER_SENTINEL_SELECTOR = "[data-public-sticky-filter-sentinel]";
const STICKY_FILTER_OFFSET_VISIBLE = "var(--public-header-height, 74px)";
const HEADER_HIDE_DELTA = 4;
const HEADER_REVEAL_DELTA = 1;
const LAST_PUBLIC_CATEGORY_KEY = "anganstay:last-public-category";
const PUBLIC_HEADER_CATEGORY_VALUES = new Set<PropertyCategory>([
  "property",
  "home",
  "apartment",
  "hostel",
  "shop",
  "office",
]);

function BrandLogoMark({ size = "default" }: { size?: "default" | "mobile" }) {
  const iconSizeClass = size === "mobile" ? "h-9 w-9" : "h-20 w-20";
  const brandTextClass = size === "mobile" ? "text-lg" : "text-[20px]";
  const taglineClass = size === "mobile" ? "text-[8px]" : "text-[9px]";

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span
        className={`${iconSizeClass} relative inline-flex shrink-0 items-center justify-center overflow-hidden`}
        aria-hidden="true"
      >
        <Image
          src="/light.png"
          alt=""
          fill
          quality={100}
          sizes={size === "mobile" ? "36px" : "80px"}
          className="public-logo-image-dark object-contain scale-125"
          priority
        />

        <Image
          src="/dark.png"
          alt=""
          fill
          quality={100}
          sizes={size === "mobile" ? "36px" : "80px"}
          className="public-logo-image-light object-contain scale-125"
          priority
        />
      </span>

      <span className="-ml-1 flex flex-col justify-center leading-none">
        <span
          className={`${brandTextClass} font-black tracking-[-0.05em] text-[var(--admin-text)]`}
        >
          Angan<span className="text-[var(--admin-primary)]">Stay</span>
        </span>

        <span
          className={`${taglineClass} mt-[3px] font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]`}
        >
          Find Your Angan
        </span>
      </span>
    </span>
  );
}

const readStoredPublicCategory = (): PropertyCategory | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.sessionStorage.getItem(LAST_PUBLIC_CATEGORY_KEY);

    return PUBLIC_HEADER_CATEGORY_VALUES.has(value as PropertyCategory)
      ? (value as PropertyCategory)
      : null;
  } catch {
    return null;
  }
};

export default function PublicHeader() {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hasStickyFilters, setHasStickyFilters] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const drawerCloseButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const headerHiddenRef = useRef(false);

  const routeCategory = getPublicCategoryFromPath(
    pathname,
  ) as PropertyCategory | null;
  const isDetailPath = isPublicPropertyDetailPath(pathname);
  const storedListingCategory =
    mounted && isDetailPath ? readStoredPublicCategory() : null;
  const activeCategory =
    isDetailPath && storedListingCategory
      ? storedListingCategory
      : routeCategory;
  const browseAllActive =
    pathname === "/" || (isDetailPath && activeCategory === "property");
  const isAccountArea = isPublicAccountRoute(pathname);
  const mobileMenuVisibilityClass = isAccountArea ? "lg:hidden" : "xl:hidden";
  const { isAuthenticated, isLoading, logout, user } = usePublicAuth();
  const { setIsHeaderHidden } = usePublicScrollHeader();

  const setHeaderHiddenState = useCallback(
    (nextHidden: boolean) => {
      if (headerHiddenRef.current === nextHidden) return;

      headerHiddenRef.current = nextHidden;
      setHeaderHidden(nextHidden);
      setIsHeaderHidden(nextHidden);
    },
    [setIsHeaderHidden],
  );

  const closeMobileMenu = () => setMobileOpen(false);
  const closeProfileMenu = () => setProfileOpen(false);

  const firstName =
    user?.name?.trim()?.split(/\s+/)?.[0] ||
    user?.email?.split("@")?.[0] ||
    "Account";

  useEffect(() => {
    if (!mounted || isDetailPath) return;

    const currentListingCategory: PropertyCategory | null =
      pathname === "/" ? "property" : routeCategory;

    if (currentListingCategory) {
      try {
        window.sessionStorage.setItem(
          LAST_PUBLIC_CATEGORY_KEY,
          currentListingCategory,
        );
      } catch {
        // Ignore storage failures; route-derived active state still works.
      }
    }
  }, [isDetailPath, mounted, pathname, routeCategory]);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeaderHeight = () => {
      const height = Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty(
        "--public-header-height",
        `${height}px`,
      );
    };

    updateHeaderHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeaderHeight);
      return () => window.removeEventListener("resize", updateHeaderHeight);
    }

    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(header);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let frameId: number | null = null;
    let resetForPath = false;

    const detectStickyFiltersPage = () => {
      const enabled = Boolean(
        document.querySelector(STICKY_FILTERS_PAGE_SELECTOR),
      );

      setHasStickyFilters((current) =>
        current === enabled ? current : enabled,
      );

      if (!enabled || !resetForPath) {
        setHeaderHiddenState(false);
        lastScrollYRef.current = window.scrollY;
        resetForPath = true;
      }
    };

    const scheduleDetection = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        detectStickyFiltersPage();
      });
    };

    scheduleDetection();

    const timeoutId = window.setTimeout(scheduleDetection, 120);
    const observer =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(scheduleDetection);

    observer?.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.clearTimeout(timeoutId);
      observer?.disconnect();
    };
  }, [mounted, pathname, setHeaderHiddenState]);

  useLayoutEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    if (hasStickyFilters) {
      root.style.setProperty(
        "--public-sticky-filter-offset",
        headerHidden ? "0px" : STICKY_FILTER_OFFSET_VISIBLE,
      );
    } else {
      root.style.removeProperty("--public-sticky-filter-offset");
    }
  }, [hasStickyFilters, headerHidden, mounted]);

  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty(
        "--public-sticky-filter-offset",
      );
      setIsHeaderHidden(false);
    };
  }, [setIsHeaderHidden]);

  useEffect(() => {
    if (!hasStickyFilters || !mounted) return;

    lastScrollYRef.current = window.scrollY;

    const filtersHaveReachedHeader = () => {
      const sentinel = document.querySelector(STICKY_FILTER_SENTINEL_SELECTOR);
      if (!sentinel) return false;

      const headerHeight =
        headerRef.current?.getBoundingClientRect().height ||
        Number.parseFloat(
          window
            .getComputedStyle(document.documentElement)
            .getPropertyValue("--public-header-height"),
        ) ||
        74;

      return sentinel.getBoundingClientRect().top <= headerHeight + 1;
    };

    const handleScroll = () => {
      if (scrollAnimationFrameRef.current !== null) return;

      scrollAnimationFrameRef.current = window.requestAnimationFrame(() => {
        scrollAnimationFrameRef.current = null;

        const currentScrollY = Math.max(window.scrollY, 0);
        const previousScrollY = lastScrollYRef.current;
        const delta = currentScrollY - previousScrollY;
        const filtersTouchingHeader = filtersHaveReachedHeader();

        if (currentScrollY <= 12 || !filtersTouchingHeader) {
          setHeaderHiddenState(false);
          lastScrollYRef.current = currentScrollY;
          return;
        }

        if (delta < -HEADER_REVEAL_DELTA) {
          setHeaderHiddenState(false);
          lastScrollYRef.current = currentScrollY;
          return;
        }

        if (delta > HEADER_HIDE_DELTA && !mobileOpen && !profileOpen) {
          setHeaderHiddenState(true);
          lastScrollYRef.current = currentScrollY;
          return;
        }

        if (Math.abs(delta) > HEADER_REVEAL_DELTA) {
          lastScrollYRef.current = currentScrollY;
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (scrollAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollAnimationFrameRef.current);
        scrollAnimationFrameRef.current = null;
      }
    };
  }, [
    hasStickyFilters,
    mobileOpen,
    mounted,
    profileOpen,
    setHeaderHiddenState,
  ]);

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
      className={`fixed inset-0 z-[1000] transition-[visibility] duration-300 ${mobileMenuVisibilityClass} ${
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
        className={`absolute inset-0 h-full w-full bg-slate-950/55 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          mobileOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        id="public-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`relative z-10 ml-auto flex h-dvh w-full flex-col overflow-hidden border-l border-[var(--admin-border)] bg-[var(--admin-background)] shadow-[-24px_0_60px_-36px_rgba(15,23,42,0.55)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          mobileOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--admin-border)] px-4 py-3.5">
          <Link
            href="/"
            onClick={closeMobileMenu}
            aria-label="AnganStay home"
            className="public-logo-link inline-flex min-w-0 items-center text-[var(--admin-text)] transition hover:opacity-90"
          >
            <BrandLogoMark size="mobile" />
          </Link>

          <button
            type="button"
            ref={drawerCloseButtonRef}
            aria-label="Close navigation"
            onClick={closeMobileMenu}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-background)] text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid gap-5">
            <MobileDrawerSection title="Primary actions">
              <MobileDrawerLink
                href="/"
                active={browseAllActive}
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

            <MobileDrawerSection title="Display">
              <ThemeToggle className="w-full justify-start rounded-2xl px-4 py-2.5" />
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
                      className="inline-flex min-h-11 items-center gap-3 rounded-2xl bg-[var(--admin-card)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-muted)] transition hover:bg-[var(--admin-surface)] hover:text-[var(--admin-primary)]"
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
      <header
        ref={headerRef}
        className={`sticky top-0 z-50 transform-gpu border-b border-[color:color-mix(in_srgb,var(--admin-border)_86%,transparent)] bg-[color:color-mix(in_srgb,var(--admin-background)_94%,transparent)] backdrop-blur-xl transition-transform duration-300 ease-out will-change-transform ${
          hasStickyFilters && headerHidden
            ? "pointer-events-none -translate-y-full"
            : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-6">
            <Link
              href="/"
              aria-label="AnganStay home"
              className="public-logo-link inline-flex min-w-0 items-center text-[var(--admin-text)] transition hover:opacity-90"
            >
              <BrandLogoMark />
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

          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle compact className="hidden lg:inline-flex" />

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
                    onClick={() => {
                      setHeaderHiddenState(false);
                      setProfileOpen((current) => !current);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-background)] py-1.5 pl-1.5 pr-3 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary)]/10"
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
                      className={`absolute right-0 top-[calc(100%+0.75rem)] z-[80] w-[310px] origin-top-right overflow-hidden rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-card)] p-2 shadow-[0_24px_70px_-38px_var(--admin-shadow)] transition-[opacity,transform] duration-200 ease-out ${
                        profileOpen
                          ? "translate-y-0 scale-100 opacity-100"
                          : "-translate-y-2 scale-95 opacity-0"
                      }`}
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
                          icon={UserCircle2}
                          label="Profile"
                          description="Manage profile and account details"
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
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold text-[var(--admin-error)] transition hover:bg-[var(--admin-error-soft)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-error-soft)]"
                        >
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--admin-error-soft)] text-[var(--admin-error)]">
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
                  className="hidden rounded-full border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-2.5 text-sm font-medium text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] lg:inline-flex"
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
              onClick={() => {
                setHeaderHiddenState(false);
                setMobileOpen(true);
              }}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-background)] text-[var(--admin-icon)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] ${mobileMenuVisibilityClass} ${
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
