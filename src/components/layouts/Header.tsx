import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle, ChevronDown, LayoutDashboard, LogOut, Menu, Moon, Search, Sun, User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import BrandLogo from '@/components/common/BrandLogo';
import CopyPublicProfileButton from '@/components/common/CopyPublicProfileButton';
import NotificationBell from '@/components/common/NotificationBell';
import LocaleControls from '@/components/layouts/LocaleControls';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePrefetch } from '@/hooks/usePrefetch';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
}

const PRODUCTS_MENU: NavItem[] = [
  { label: 'Browse Products', href: '/products' },
  { label: 'Product Categories', href: '/categories' },
];

const SUPPLIERS_MENU: NavItem[] = [
  { label: 'Supplier Directory', href: '/manufacturers' },
  { label: 'Subscription Plans', href: '/pricing' },
];

const RFQ_MENU: NavItem[] = [
  { label: 'Live Buying Requirements', href: '/requirements' },
  { label: 'Post a Requirement', href: '/post-requirement' },
  { label: 'My Quotations', href: '/my-quotations' },
];

const TRADE_TOOLS: NavItem[] = [
  { label: 'AI Import & Export Assistant', href: '/trade-assistant' },
  { label: 'Shipping Calculator', href: '/shipping-calculator' },
  { label: 'Order Loan Calculator', href: '/loan-calculator' },
];

const RESOURCES: NavItem[] = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Blog', href: '/blog' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
];

const NAV_TRIGGER =
  'h-9 gap-1 px-2 text-[13px] font-semibold text-foreground hover:text-primary 2xl:px-3 2xl:text-sm';

/** Dropdown of links used by the main navigation and the Buyer and Supplier menus. */
function MenuDropdown({ label, items, className }: { label: string; items: NavItem[]; className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn(NAV_TRIGGER, className)}>
          {label}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 border-border bg-popover">
        {items.map((item) => (
          <DropdownMenuItem key={`${label}-${item.label}`} asChild>
            <Link to={item.href} className="cursor-pointer">
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNavSection({ title, items, onNavigate }: { title: string; items: NavItem[]; onNavigate: () => void }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={`${title}-${item.label}`}>
            <Link
              to={item.href}
              onClick={onNavigate}
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Header() {
  const { user, profile, signOut, loading, resolvedRole, displayName, dashboardPath } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { getPrefetchHandlers } = usePrefetch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isHome = location.pathname === '/';
  const isSupplier = resolvedRole === 'supplier' || profile?.role === 'supplier';
  const isAdmin = resolvedRole === 'admin' || profile?.role === 'admin';
  const accountLabel = isSupplier ? 'Supplier' : isAdmin ? 'Admin' : 'Buyer';
  const profilePath = isSupplier ? '/dashboard/supplier/profile' : '/dashboard/buyer/profile';

  const getDashboardLink = () => {
    if (!user) return '/auth';
    if (loading) return dashboardPath !== '/auth' ? dashboardPath : '/auth';
    if (dashboardPath && dashboardPath !== '/auth') return dashboardPath;
    if (!profile && !resolvedRole) return '/auth';
    if (isAdmin) return '/dashboard/admin';
    if (isSupplier) return '/dashboard/supplier';
    return '/dashboard/buyer';
  };
  const dashboardLink = getDashboardLink();
  const firstName = (displayName || profile?.full_name || 'Account').split(' ')[0];
  const initial = (displayName || profile?.full_name || user?.email || 'U')[0]?.toUpperCase() ?? 'U';

  const buyerItems: NavItem[] = [
    { label: 'Post a Requirement', href: '/post-requirement' },
    { label: 'Browse Products', href: '/products' },
    user && !isSupplier
      ? { label: 'Buyer Dashboard', href: dashboardLink }
      : { label: 'Join as Buyer', href: '/register' },
  ];
  const supplierItems: NavItem[] = [
    user && isSupplier
      ? { label: 'Supplier Dashboard', href: dashboardLink }
      : { label: 'Join as Supplier', href: '/auth?tab=supplier' },
    { label: 'Subscription Plans', href: '/pricing' },
    { label: 'Live RFQs from buyers', href: '/requirements' },
  ];

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(`${href}/`);
  const closeMenu = () => setMobileOpen(false);

  const submitSearch = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/products?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    closeMenu();
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    try {
      setIsSigningOut(true);
      setUserMenuOpen(false);
      closeMenu();
      await signOut();
      toast.success('Signed out successfully');
      if (location.pathname !== '/') {
        navigate('/');
      }
    } catch (err) {
      console.error('Sign out error:', err);
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="relative z-40 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="mr-2 shrink-0 xl:mr-4" aria-label="BulkSkart home">
          <BrandLogo size="responsive" linkTo={null} />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center xl:flex">
          <MenuDropdown label="Products" items={PRODUCTS_MENU} />
          <MenuDropdown label="Suppliers" items={SUPPLIERS_MENU} />
          <MenuDropdown label="RFQ" items={RFQ_MENU} />
          <Link
            to="/auctions"
            {...getPrefetchHandlers('/auctions')}
            aria-current={isActive('/auctions') ? 'page' : undefined}
            className={cn(
              'rounded-md px-2 py-2 text-[13px] font-semibold transition-colors hover:text-primary 2xl:px-3 2xl:text-sm',
              isActive('/auctions') ? 'text-primary' : 'text-foreground',
            )}
          >
            Auctions
          </Link>
          <MenuDropdown label="Trade Tools" items={TRADE_TOOLS} />
          <MenuDropdown label="Resources" items={RESOURCES} />
        </nav>

        <div className="ml-auto flex items-center gap-0.5">
          <div className="hidden items-center xl:flex">
            <LocaleControls variant="compact" />
            <MenuDropdown label="Buyer" items={buyerItems} />
            <MenuDropdown label="Supplier" items={supplierItems} />
          </div>

          {!isHome && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden h-9 w-9 text-muted-foreground hover:text-foreground xl:inline-flex"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </Button>
          <CopyPublicProfileButton compact />
          <NotificationBell />

          {user ? (
            <>
              <Link
                to={dashboardLink}
                aria-label="Open dashboard"
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground xl:hidden"
              >
                {initial}
              </Link>
              <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="My account menu"
                    className="hidden h-9 gap-2 px-2 text-[13px] font-medium text-foreground hover:bg-muted xl:inline-flex"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {initial}
                    </span>
                    <span className="max-w-[90px] truncate">{firstName}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-border bg-popover">
                  <div className="border-b border-border px-2 py-1.5">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {displayName || profile?.full_name || 'My account'}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                    <span className="mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                      {accountLabel}
                    </span>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to={dashboardLink} className="flex cursor-pointer items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={profilePath} className="flex cursor-pointer items-center gap-2">
                      <User className="h-4 w-4" aria-hidden="true" /> Profile & settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings/delete-account" className="flex cursor-pointer items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" /> Delete account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      void handleSignOut();
                    }}
                    disabled={isSigningOut}
                    className="flex cursor-pointer items-center gap-2 font-medium text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="h-9 px-2.5 text-[13px] font-semibold 2xl:text-sm">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="ml-1 hidden h-9 rounded-md bg-primary px-4 text-[13px] font-bold text-primary-foreground hover:bg-primary/90 sm:inline-flex 2xl:text-sm"
              >
                <Link to="/register">Join Free</Link>
              </Button>
            </>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 xl:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-[min(320px,88vw)] flex-col gap-0 overflow-hidden border-border bg-background p-0"
            >
              <div className="border-b border-border px-4 py-3">
                <BrandLogo size="sm" variant="auto" linkTo="/" />
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
                <MobileNavSection title="Marketplace" items={[...PRODUCTS_MENU, { label: 'Auctions', href: '/auctions' }]} onNavigate={closeMenu} />
                <MobileNavSection title="Suppliers" items={SUPPLIERS_MENU} onNavigate={closeMenu} />
                <MobileNavSection title="RFQ" items={RFQ_MENU} onNavigate={closeMenu} />
                <MobileNavSection title="Trade tools" items={TRADE_TOOLS} onNavigate={closeMenu} />
                <MobileNavSection title="Resources" items={RESOURCES} onNavigate={closeMenu} />
                <MobileNavSection title="Buyers" items={buyerItems} onNavigate={closeMenu} />
                <MobileNavSection title="Account" items={supplierItems} onNavigate={closeMenu} />
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Country, language and theme
                  </p>
                  <LocaleControls variant="full" className="items-stretch" />
                  <Button
                    variant="outline"
                    onClick={toggleTheme}
                    className="h-10 w-full justify-center gap-2 font-semibold text-primary"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-border p-4">
                {user ? (
                  <>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {displayName || profile?.full_name || 'My account'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="px-1">
                      <CopyPublicProfileButton />
                    </div>
                    <Button asChild variant="outline" className="h-11 w-full font-semibold text-primary">
                      <Link to={dashboardLink} onClick={closeMenu}>
                        <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void handleSignOut()}
                      className="h-11 w-full font-semibold text-destructive"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="h-11 w-full bg-primary font-bold text-primary-foreground hover:bg-primary/90">
                      <Link to="/register" onClick={closeMenu}>Join Free</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-11 w-full font-semibold text-primary">
                      <Link to="/login" onClick={closeMenu}>Sign In</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {searchOpen && !isHome && (
        <form role="search" onSubmit={submitSearch} className="border-t border-border px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex h-10 max-w-[1500px] items-center gap-2 rounded-xl border border-border bg-muted px-3 focus-within:border-primary/60">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="header-search" className="sr-only">
              Search products
            </label>
            <input
              id="header-search"
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products, suppliers, categories"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="sm" className="h-8 bg-primary px-3 font-bold text-primary-foreground hover:bg-primary/90">
              Search
            </Button>
          </div>
        </form>
      )}
    </header>
  );
}
