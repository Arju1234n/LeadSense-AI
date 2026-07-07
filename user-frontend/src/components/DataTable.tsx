'use client';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  maxHeight?: string;
}

export default function DataTable<T>({ 
  data, 
  columns,
  maxHeight = '500px'
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full table-container bg-bg-secondary transition-colors duration-300">
      <div className="overflow-x-auto no-scrollbar" style={{ maxHeight }}>
        <table className="w-full border-collapse">
          <thead className="table-header">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border-primary">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="table-head"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border-primary/60">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-sm font-medium text-text-secondary"
                >
                  No data available
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, rowIdx) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(rowIdx * 0.03, 0.3) }}
                  className="table-row group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="table-cell font-medium group-hover:text-accent transition-colors duration-150"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
