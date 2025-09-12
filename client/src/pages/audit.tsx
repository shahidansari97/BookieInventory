import { useState } from "react";
import { Filter, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/tables/data-table";
import { type AuditLog, type UserPublic } from "@shared/schema";

export default function Audit() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  // Fetch users for filter dropdown
  const { data: users = [] } = useQuery<UserPublic[]>({
    queryKey: ["/api/users"],
  });

  // Build query parameters for audit logs
  const buildAuditQuery = () => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('startDate', dateFrom);
    if (dateTo) params.append('endDate', dateTo);
    if (actionFilter !== "all") params.append('action', actionFilter);
    if (userFilter !== "all") params.append('userId', userFilter);
    params.append('page', '1');
    params.append('limit', '100');
    return params.toString();
  };

  // Fetch audit logs with current filters
  const { data: auditResponse, isLoading } = useQuery({
    queryKey: ["/api/audit", dateFrom, dateTo, actionFilter, userFilter],
    queryFn: async () => {
      const queryString = buildAuditQuery();
      const response = await fetch(`/api/audit?${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      return response.json();
    },
  });

  // Transform audit logs to ensure dates are Date objects
  const auditLogs = auditResponse?.data?.map(log => ({
    ...log,
    createdAt: new Date(log.createdAt)
  })) || [];
  const pagination = auditResponse?.pagination;

  const handleClearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setActionFilter("all");
    setUserFilter("all");
  };

  const getActionBadgeColor = (action: string) => {
    const colors = {
      CREATE: "bg-green-100 text-green-600",
      UPDATE: "bg-yellow-100 text-yellow-600", 
      DELETE: "bg-red-100 text-red-600",
      LOGIN: "bg-blue-100 text-blue-600",
      CALCULATE: "bg-purple-100 text-purple-600",
    };
    return colors[action as keyof typeof colors] || "bg-gray-100 text-gray-600";
  };

  const columns = [
    {
      key: "createdAt",
      title: "Timestamp",
      render: (value: Date) => (
        <div className="text-sm" data-testid={`audit-timestamp-${value.getTime()}`}>
          {value.toLocaleDateString("en-IN")} {value.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          })}
        </div>
      ),
    },
    {
      key: "userId",
      title: "User",
      render: (value: string) => {
        const user = users.find(u => u.id === value);
        return (
          <div className="font-medium" data-testid={`audit-user-${value}`}>
            {user?.username || "Unknown"}
          </div>
        );
      },
    },
    {
      key: "action",
      title: "Action",
      render: (value: string) => (
        <Badge 
          variant="outline"
          className={getActionBadgeColor(value)}
          data-testid={`audit-action-${value}`}
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "resource",
      title: "Resource",
      render: (value: string) => (
        <div className="text-sm" data-testid="audit-resource">
          {value}
        </div>
      ),
    },
    {
      key: "details",
      title: "Details",
      render: (value: string) => (
        <div className="text-sm max-w-xs truncate" data-testid="audit-details" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: "ipAddress",
      title: "IP Address",
      render: (value: string | null) => (
        <div className="text-sm font-mono" data-testid="audit-ip">
          {value || "-"}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6" data-testid="audit-page">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" data-testid="audit-title">
          Audit Trail
        </h2>
        <p className="text-muted-foreground" data-testid="audit-description">
          Track all system activities and changes
        </p>
      </div>

      {/* Audit Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="date-from">Date From</Label>
              <Input
                id="date-from"
                type="date"
                className="mt-2"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                data-testid="audit-date-from-input"
              />
            </div>
            <div>
              <Label htmlFor="date-to">Date To</Label>
              <Input
                id="date-to"
                type="date"
                className="mt-2"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                data-testid="audit-date-to-input"
              />
            </div>
            <div>
              <Label htmlFor="action-filter">Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="mt-2" data-testid="audit-action-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="CALCULATE">Calculate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="user-filter">User</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="mt-2" data-testid="audit-user-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                className="w-full mt-2"
                onClick={handleClearFilters}
                data-testid="audit-clear-filters-button"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8" data-testid="audit-loading">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading audit logs...</span>
        </div>
      ) : (
        <DataTable
          data={auditLogs}
          columns={columns}
          testId="audit-log-table"
        />
      )}
      
      {pagination && (
        <div className="mt-4 text-sm text-muted-foreground text-center" data-testid="audit-pagination-info">
          Showing {pagination.page === 1 ? 1 : (pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
        </div>
      )}
    </div>
  );
}
