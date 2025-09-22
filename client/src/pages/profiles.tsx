import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
import ProfileModal from "@/components/modals/profile-modal";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Profile, type InsertProfile } from "@shared/schema";
import axios from "@/config/axiosInstance";
import { API } from "@/config/apiEndpoints";

export default function Profiles() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { toast } = useToast();

  // Fetch profiles from API with pagination
  const { data: profilesData, isLoading } = useQuery({
    queryKey: ["profiles", currentPage, pageSize, searchTerm, typeFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      // Add search parameter if provided
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      // Add type filter if not "all"
      if (typeFilter !== "all") {
        params.append('type', typeFilter);
      }

      // Add status filter if not "all"
      if (statusFilter !== "all") {
        params.append('status', statusFilter);
      }

      const response = await axios.get(`${API.PROFILE_INDEX}?${params.toString()}`);
      return response.data;
    },
  });

  const profiles = profilesData?.data || [];
  const totalPages = Math.ceil((profilesData?.total || 0) / pageSize);
  const totalItems = profilesData?.total || 0;

  // Delete profile mutation
  const deleteProfileMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`${API.PROFILE_INDEX}/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast({
        title: "Success",
        description: "Profile deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete profile",
        variant: "destructive",
      });
    },
  });


  const handleAddProfile = () => {
    setSelectedProfile(null);
    setIsModalOpen(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };


  const handleDeleteProfile = (profileId: string) => {
    if (confirm("Are you sure you want to delete this profile?")) {
      deleteProfileMutation.mutate(profileId);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Search handler with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Filter handlers
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const columns = [
    {
      key: "name",
      title: "Name",
      render: (value: string, row: Profile) => (
        <div>
          <div className="font-medium" data-testid={`profile-name-${row.id}`}>
            {value}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.notes || `${row.type} profile`}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      title: "Type",
      render: (value: string) => (
        <Badge 
          variant={value === "uplink" ? "default" : "secondary"}
          className={
            value === "uplink" 
              ? "bg-primary/10 text-primary" 
              : "bg-green-100 text-green-600"
          }
          data-testid={`profile-type-${value}`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: "phone",
      title: "Contact",
      render: (value: string, row: Profile) => (
        <div>
          <div data-testid={`profile-phone-${row.id}`}>{value}</div>
          {row.email && (
            <div className="text-sm text-muted-foreground" data-testid={`profile-email-${row.id}`}>
              {row.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "ratePerPoint",
      title: "Rate/Point",
      align: "right" as const,
      render: (value: string) => `₹${parseFloat(value).toFixed(2)}`,
    },
    {
      key: "commissionPercentage",
      title: "Commission",
      align: "right" as const,
      render: (value: string | null) => value ? `${parseFloat(value)}%` : "-",
    },
    {
      key: "actions",
      title: "Actions",
      align: "center" as const,
      render: (_: any, row: Profile) => (
        <div className="flex justify-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditProfile(row)}
            data-testid={`edit-profile-${row.id}`}
          >
            <Edit className="w-4 h-4 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteProfile(row.id)}
            data-testid={`delete-profile-${row.id}`}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6" data-testid="profiles-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2" data-testid="profiles-title">
            Uplinks & Downlines
          </h2>
          <p className="text-muted-foreground" data-testid="profiles-description">
            Manage your inventory partners
          </p>
        </div>
        <Button
          onClick={handleAddProfile}
          className="mt-4 md:mt-0"
          data-testid="add-profile-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Profile
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search profiles..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  data-testid="profiles-search-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="mt-2" data-testid="profiles-type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="uplink">Uplink</SelectItem>
                  <SelectItem value="downline">Downline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="mt-2" data-testid="profiles-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                className="w-full mt-2"
                onClick={handleClearFilters}
                data-testid="profiles-clear-filters-button"
              >
                <Search className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profiles Table */}
      <DataTable
        data={profiles}
        columns={columns}
        testId="profiles-table"
        loading={isLoading}
      />

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-2">
          <Label htmlFor="page-size">Show</Label>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20" data-testid="profiles-page-size">
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
            data-testid="profiles-prev-page"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-8 h-8 p-0"
                  data-testid={`profiles-page-${pageNum}`}
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
            disabled={currentPage >= totalPages}
            data-testid="profiles-next-page"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["profiles"] });
        }}
        profile={selectedProfile}
      />
    </div>
  );
}
