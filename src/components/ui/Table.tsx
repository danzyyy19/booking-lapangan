import { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, forwardRef } from 'react'

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
    ({ className, ...props }, ref) => (
        <div className="relative w-full overflow-auto rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
            <table
                ref={ref}
                className={`w-full caption-bottom text-sm ${className}`}
                {...props}
            />
        </div>
    )
)
Table.displayName = 'Table'

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <thead ref={ref} className={`[&_tr]:border-b ${className}`} style={{ borderColor: 'var(--border-color)' }} {...props} />
    )
)
TableHeader.displayName = 'TableHeader'

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <tbody
            ref={ref}
            className={`[&_tr:last-child]:border-0 ${className}`}
            {...props}
        />
    )
)
TableBody.displayName = 'TableBody'

const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <tfoot
            ref={ref}
            className={`font-medium ${className}`}
            style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                borderTop: '1px solid var(--border-color)'
            }}
            {...props}
        />
    )
)
TableFooter.displayName = 'TableFooter'

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
    ({ className, ...props }, ref) => (
        <tr
            ref={ref}
            className={`
                transition-colors hover:bg-[var(--bg-hover)] 
                data-[state=selected]:bg-[var(--bg-secondary)]
                ${className}
            `}
            style={{ borderBottom: '1px solid var(--border-color)' }}
            {...props}
        />
    )
)
TableRow.displayName = 'TableRow'

const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
    ({ className, ...props }, ref) => (
        <th
            ref={ref}
            className={`
                h-12 px-4 text-left align-middle font-medium
                ${className}
            `}
            style={{ color: 'var(--text-muted)' }}
            {...props}
        />
    )
)
TableHead.displayName = 'TableHead'

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
    ({ className, ...props }, ref) => (
        <td
            ref={ref}
            className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
            style={{ color: 'var(--text-primary)' }}
            {...props}
        />
    )
)
TableCell.displayName = 'TableCell'

const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
    ({ className, ...props }, ref) => (
        <caption
            ref={ref}
            className={`mt-4 text-sm ${className}`}
            style={{ color: 'var(--text-muted)' }}
            {...props}
        />
    )
)
TableCaption.displayName = 'TableCaption'

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}
