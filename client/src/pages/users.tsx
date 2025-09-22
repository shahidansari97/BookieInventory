import { useState, useEffect } from "react";
import { UserPlus, Edit, Ban, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "@/components/tables/data-table";
import UserModal from "@/components/modals/user-modal";
import { type UserPublic } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useError } from "@/hooks/useError";
import axios from "@/config/axiosInstance";
import { API } from "@/config/apiEndpoints";

// User interface based on API response
interface User {
  id: string;
  name: string;
  email: string;
  country_code: string;
  phone: string;
  role: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

// API response interface
interface UserListResponse {
  success: boolean;
  message: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  data: User[];
}

export default function Users() {
  const { success, handleApi } = useError();
  const queryClient = useQueryClient();

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users with filters and pagination
  const { data: usersData, isLoading, error } = useQuery<UserListResponse>({
    queryKey: ['users', currentPage, pageSize, debouncedSearchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const url = `${API.USER_INDEX}?${params.toString()}`;
      console.log('🔍 Fetching users:', url);
      
      const response = await axios.get(url);
      console.log('📊 User API response:', {
        success: response.data.success,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalItems: response.data.totalItems,
        dataLength: response.data.data?.length || 0
      });
      
      return response.data;
    },
    enabled: true,
  });

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };


  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };


  // Handle modal
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const handleUserSubmit = (data: any) => {
    // User modal handles its own API call
    // This function is called after successful submission
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const handleToggleUserStatus = (userId: string) => {
    const user = usersData?.data?.find(u => u.id === userId);
    if (user) {
      // TODO: Implement user status toggle API
      console.log('Toggle user status:', userId);
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "1": return "Admin";
      case "2": return "Bookie";
      case "3": return "Assistant";
      default: return "Unknown";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "1": return "destructive";
      case "2": return "default";
      case "3": return "secondary";
      default: return "outline";
    }
  };

  const columns = [
    {
      key: "name",
      title: "Name",
      render: (value: string) => (
        <div className="font-medium" data-testid={`user-name-${value}`}>
          {value}
        </div>
      ),
    },
    {
      key: "email",
      title: "Email",
      render: (value: string) => (
        <div className="text-sm" data-testid="user-email">
          {value}
        </div>
      ),
    },
    {
      key: "phone",
      title: "Phone",
      render: (value: string, row: any) => (
        <div className="text-sm" data-testid="user-phone">
          {row.country_code} {value}
        </div>
      ),
    },
    {
      key: "role",
      title: "Role",
      render: (value: string) => (
        <Badge 
          variant={getRoleBadgeVariant(value)}
          className={
            value === "1" 
              ? "bg-red-100 text-red-600" 
              : value === "2"
              ? "bg-primary/10 text-primary"
              : "bg-secondary/50 text-secondary-foreground"
          }
          data-testid={`user-role-${value}`}
        >
          {getRoleDisplay(value)}
        </Badge>
      ),
    },
    {
      key: "status",
      title: "Status",
      align: "center" as const,
      render: (value: boolean) => (
        <Badge 
          variant="outline"
          className={value ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}
          data-testid={`user-status-${value ? "active" : "inactive"}`}
        >
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      align: "center" as const,
      render: (_: any, row: User) => (
        <div className="flex justify-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditUser(row)}
            data-testid={`edit-user-${row.id}`}
          >
            <Edit className="w-4 h-4 text-primary" />
          </Button>
          {row.name !== "admin" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleUserStatus(row.id)}
              data-testid={`toggle-user-${row.id}`}
            >
              <Ban className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p>Error loading users: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6" data-testid="users-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and permissions
          </p>
        </div>
        <Button onClick={handleAddUser} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 w-full">
        <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6 w-full">
          <div className="flex flex-col xl:flex-row gap-4 items-end w-full">
            {/* Search */}
            <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <Label className="text-sm font-semibold text-gray-800">Search</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-10 pr-10 bg-white border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
              </div>
            </div>


            {/* Status Filter */}
            <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
              <Label className="text-sm font-semibold text-gray-800">Status</Label>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full h-10 bg-white border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading users...</div>
            </div>
          ) : !usersData?.data || usersData.data.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <p className="text-muted-foreground text-lg mb-6">No users found</p>
                <Button 
                  onClick={handleAddUser}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First User
                </Button>
              </div>
            </div>
          ) : (
            <DataTable
              data={usersData.data}
              columns={columns}
              itemsPerPage={10}
              testId="users-table"
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls - Only show when there are results */}
      {usersData?.success !== false && !error && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <Label htmlFor="page-size">Show</Label>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20" data-testid="users-page-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="page-size">entries</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              data-testid="users-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {usersData && Array.from({ length: Math.min(5, usersData.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(usersData.totalPages - 4, currentPage - 2)) + i;
                if (pageNum > usersData.totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                    data-testid={`users-page-${pageNum}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= (usersData?.totalPages || 1)}
              data-testid="users-next-page"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              "Loading..."
            ) : (
              `Showing ${((currentPage - 1) * pageSize) + 1} to ${Math.min(currentPage * pageSize, usersData?.totalItems || 0)} of ${usersData?.totalItems || 0} entries`
            )}
          </div>
        </div>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleUserSubmit}
        user={selectedUser}
      />
    </div>
  );
}