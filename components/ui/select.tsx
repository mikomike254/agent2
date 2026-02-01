'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const SelectContext = React.createContext<{
    value?: string;
    onValueChange?: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
} | null>(null);

export function Select({
    value,
    onValueChange,
    children
}: {
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
}) {
    const [open, setOpen] = React.useState(false);
    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative w-full">{children}</div>
        </SelectContext.Provider>
    );
}

export function SelectTrigger({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const context = React.useContext(SelectContext);
    return (
        <button
            type="button"
            onClick={() => context?.setOpen(!context.open)}
            className={cn(
                'flex h-12 w-full items-center justify-between rounded-xl border border-[var(--bg-input)] bg-[var(--bg-test)] px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400',
                className
            )}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
    const context = React.useContext(SelectContext);
    return (
        <span className="block truncate">
            {context?.value || placeholder}
        </span>
    );
}

export function SelectContent({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const context = React.useContext(SelectContext);
    if (!context?.open) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={() => context.setOpen(false)}
            />
            <div
                className={cn(
                    'absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-[var(--bg-input)] bg-white text-zinc-950 shadow-md animate-in fade-in zoom-in-95 duration-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
                    className
                )}
            >
                <div className="p-1">{children}</div>
            </div>
        </>
    );
}

export function SelectItem({
    value,
    children,
    className
}: {
    value: string;
    children: React.ReactNode;
    className?: string;
}) {
    const context = React.useContext(SelectContext);
    const isSelected = context?.value === value;

    return (
        <div
            onClick={() => {
                context?.onValueChange?.(value);
                context?.setOpen(false);
            }}
            className={cn(
                'relative flex w-full cursor-default select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-zinc-100 focus:bg-zinc-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800',
                isSelected && 'bg-zinc-100 dark:bg-zinc-800',
                className
            )}
        >
            {isSelected && (
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                </span>
            )}
            <span className="truncate">{children}</span>
        </div>
    );
}
