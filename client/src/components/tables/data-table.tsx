import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
  testId?: string;
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  itemsPerPage = 10,
  testId = "data-table",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const getCellValue = (row: T, key: string) => {
    return key.includes('.') 
      ? key.split('.').reduce((obj, k) => obj?.[k], row as any)
      : (row as any)[key];
  };

  return (
    <Card className="overflow-hidden" data-testid={testId}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={`text-sm font-medium ${
                    column.align === "right" ? "text-right" :
                    column.align === "center" ? "text-center" : 
                    "text-left"
                  }`}
                  data-testid={`table-header-${String(column.key)}`}
                >
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row) => (
              <TableRow
                key={row.id}
                className="border-b border-border/50 hover:bg-muted/50"
                data-testid={`table-row-${row.id}`}
              >
                {columns.map((column, index) => {
                  const value = getCellValue(row, String(column.key));
                  return (
                    <TableCell
                      key={index}
                      className={`py-3 px-4 ${
                        column.align === "right" ? "text-right" :
                        column.align === "center" ? "text-center" : 
                        "text-left"
                      }`}
                      data-testid={`table-cell-${row.id}-${String(column.key)}`}
                    >
                      {column.render ? column.render(value, row) : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-muted border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground" data-testid="pagination-info">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              data-testid="pagination-previous"
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  data-testid={`pagination-page-${page}`}
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              data-testid="pagination-next"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
