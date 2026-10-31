import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Section heading with the orange bar, an optional chip beside it and a "view all" link. */
export function SectionTitle({
  title,
  chip,
  href,
  linkLabel,
}: {
  title: string;
  chip?: React.ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          <span aria-hidden="true" className="h-6 w-1 rounded-full bg-primary sm:h-7" />
          {title}
        </h2>
        {chip}
      </div>
      {href && linkLabel && (
        <Link
          to={href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** Small status pill used beside section titles. */
export function Chip({
  tone = 'orange',
  children,
}: {
  tone?: 'orange' | 'green' | 'red';
  children: React.ReactNode;
}) {
  const tones = {
    orange: 'border-primary/40 bg-primary/10 text-primary',
    green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    red: 'border-red-500/40 bg-red-500/10 text-red-400',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('relative flex h-2 w-2', className)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
    </span>
  );
}

/** Pill tabs used to filter a section by category or auction type. */
export function TabPills<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: ReadonlyArray<{ id: T; label: string }>;
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="scrollbar-none -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/** Horizontal scroller on phones, grid from the small breakpoint up. Pass the grid columns as `cols`. */
export function Rail({ children, cols, className }: { children: React.ReactNode; cols: string; className?: string }) {
  return (
    <ul
      className={cn(
        'scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0',
        cols,
        className,
      )}
    >
      {children}
    </ul>
  );
}

export function RailItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <li className={cn('w-[78%] shrink-0 snap-start sm:w-auto', className)}>{children}</li>;
}

/** Placeholder cards shown while a section loads. */
export function SkeletonRail({ count, cols, heightClass }: { count: number; cols: string; heightClass: string }) {
  return (
    <ul aria-hidden="true" className={cn('grid gap-3 sm:gap-4', cols)}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className={cn('animate-pulse rounded-2xl border border-border bg-card', heightClass)} />
      ))}
    </ul>
  );
}

interface StateCardProps {
  message: string;
  onRetry?: () => void;
  actionHref?: string;
  actionLabel?: string;
}

/** Empty and error state. It says what is missing and never fills the gap with sample cards. */
export function StateCard({ message, onRetry, actionHref, actionLabel }: StateCardProps) {
  return (
    <div
      role="status"
      className="flex flex-col gap-4 rounded-2xl border border-dashed border-border bg-card/60 p-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted-foreground">{message}</p>
      {(onRetry || actionHref) && (
        <div className="flex shrink-0 flex-wrap gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 font-semibold text-primary">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Try again
            </Button>
          )}
          {actionHref && actionLabel && (
            <Button asChild size="sm" className="font-bold">
              <Link to={actionHref}>{actionLabel}</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function VerifiedBadge({ label = 'Verified Supplier' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
      <BadgeCheck className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}

/** Flag emoji circle used beside supplier and buyer locations. Renders nothing for unknown countries. */
export function FlagBadge({ flag }: { flag: string }) {
  if (!flag) return null;
  return (
    <span aria-hidden="true" className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs leading-none">
      {flag}
    </span>
  );
}
