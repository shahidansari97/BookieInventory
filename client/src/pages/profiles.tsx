import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
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
import ProfileDetailsModal from "@/components/modals/profile-details-modal";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Profile, type InsertProfile } from "@shared/schema";
import axios from "@/config/axiosInstance";
import { API } from "@/config/apiEndpoints";
import { formatCurrency } from "@/config/currency";

export default function Profiles() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [detailsProfile, setDetailsProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { toast } = useToast();

  // Profile transactions panel state
  const [txProfileId, setTxProfileId] = useState<string | null>(null);
  const [txProfileName, setTxProfileName] = useState<string>("");
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(5);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch profiles from API with pagination
  const { data: profilesData, isLoading, error } = useQuery({
    queryKey: ["profiles", currentPage, pageSize, debouncedSearchTerm, typeFilter, statusFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: pageSize.toString(),
        });

        // Add search parameter if provided
        if (debouncedSearchTerm) {
          params.append('search', debouncedSearchTerm);
        }

        // Add type filter if not "all"
        if (typeFilter !== "all") {
          params.append('type', typeFilter);
        }

        // Add status filter if not "all"
        if (statusFilter !== "all") {
          const statusValue = statusFilter === "active" ? "true" : "false";
          params.append('status', statusValue);
        }

        const response = await axios.get(`${API.PROFILE_INDEX}?${params.toString()}`);
        
        // Check if API call was successful
        if (response.data.success === false) {
          // Return empty data with success false for "not found" case
          return {
            success: false,
            message: response.data.message || "No Profile Found",
            data: null, // Keep data as null to match API response
            totalPages: 0,
            totalItems: 0
          };
        }
        
        // Validate response structure for successful response
        if (!response.data || !Array.isArray(response.data.data)) {
          throw new Error('Invalid API response structure');
        }
        
        return response.data;
      } catch (error) {
        console.error('Error fetching profiles:', error);
        toast({
          title: "Error",
          description: "Failed to fetch profiles. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const profiles = profilesData?.data || [];
  const totalPages = profilesData?.totalPages || 1;
  const totalItems = profilesData?.totalItems || 0;

  // Fetch transactions for selected profile (if any)
  const { data: txData } = useQuery({
    queryKey: ["profile-transactions", txProfileId, txPage, txPageSize],
    queryFn: async () => {
      if (!txProfileId) return null;
      const params = new URLSearchParams({
        page: txPage.toString(),
        limit: txPageSize.toString(),
        profileId: txProfileId,
      });
      const res = await axios.get(`${API.TRANSACTION_INDEX}?${params.toString()}`);
      return res.data;
    },
    enabled: !!txProfileId,
  });

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

  const handleViewDetails = (profile: Profile) => {
    setDetailsProfile(profile);
    setIsDetailsModalOpen(true);
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

  // Search handler
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
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium" data-testid={`profile-name-${row.id}`}>
            {value}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: "transactionType",
      title: "Type",
      render: (value: string) => (
        <Badge 
          variant={value === "UPLINK" ? "default" : "secondary"}
          className={
            value === "UPLINK" 
              ? "bg-primary/10 text-primary" 
              : "bg-green-100 text-green-600"
          }
          data-testid={`profile-type-${value}`}
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "phone",
      title: "Contact",
      render: (value: string, row: any) => (
        <div>
          <div data-testid={`profile-phone-${row.id}`}>
            {row.country_code} {value}
          </div>
        </div>
      ),
    },
    {
      key: "ratePerPoint",
      title: "Rate/Point",
      align: "right" as const,
      render: (value: number) => `₹${value.toFixed(2)}`,
    },
    {
      key: "commission",
      title: "Commission",
      align: "right" as const,
      render: (value: number) => `₹${value.toFixed(2)}`,
    },
    {
      key: "wallet",
      title: "Wallet",
      align: "right" as const,
      render: (value: number) => `₹${value.toFixed(2)}`,
    },
    {
      key: "status",
      title: "Status",
      align: "center" as const,
      render: (value: boolean) => (
        <Badge 
          variant={value ? "default" : "secondary"}
          className={
            value 
              ? "bg-green-100 text-green-600" 
              : "bg-red-100 text-red-600"
          }
        >
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      align: "center" as const,
      render: (value: string) => (
        <div className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      align: "center" as const,
      render: (_: any, row: any) => (
        <div className="flex justify-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditProfile(row)}
            title="Edit Profile"
            data-testid={`edit-profile-${row.id}`}
          >
            <Edit className="w-4 h-4 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewDetails(row)}
            title="View Details"
            data-testid={`view-details-${row.id}`}
          >
            <Eye className="w-4 h-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteProfile(row.id)}
            title="Delete Profile"
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
                  <SelectItem value="UPLINK">UPLINK</SelectItem>
                  <SelectItem value="DOWNLINE">DOWNLINE</SelectItem>
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
      {error ? (
        <Card className="p-8 text-center">
          <div className="text-destructive mb-4">
            <h3 className="text-lg font-semibold">Failed to load profiles</h3>
            <p className="text-sm text-muted-foreground mt-2">
              There was an error loading the profiles. Please try again.
            </p>
          </div>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["profiles"] })}
            variant="outline"
          >
            Retry
          </Button>
        </Card>
      ) : profilesData?.success === false ? (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <h3 className="text-lg font-semibold">{profilesData.message || "No Profile Found"}</h3>
          </div>
          <Button 
            onClick={handleClearFilters}
            variant="outline"
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <DataTable
          data={profiles}
          columns={columns}
          testId="profiles-table"
          loading={isLoading}
        />
      )}

      {/* Profile Transactions Panel */}
      {txProfileId && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Transactions for</div>
                <div className="text-lg font-semibold">{txProfileName}</div>
              </div>
              <div>
                <Button variant="outline" size="sm" onClick={() => setTxProfileId(null)}>Close</Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Rate</th>
                    <th className="text-left py-2">Total</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!txData?.data || txData.data.length === 0 ? (
                    <tr>
                      <td className="py-6 text-center text-muted-foreground" colSpan={6}>No transactions found</td>
                    </tr>
                  ) : (
                    txData.data.map((t: any) => (
                      <tr key={t.id} className="border-b">
                        <td className="py-2">{t.date}</td>
                        <td className="py-2">
                          <Badge variant={t.transactionType === 'UPLINK' ? 'default' : 'secondary'} className={t.transactionType === 'UPLINK' ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-600'}>
                            {t.transactionType === 'UPLINK' ? 'Taken' : 'Given'}
                          </Badge>
                        </td>
                        <td className="py-2">{formatCurrency(t.amount)}</td>
                        <td className="py-2">{formatCurrency(t.ratePerPoint)}</td>
                        <td className="py-2">{formatCurrency(t.totalAmount ?? (t.amount || 0))}</td>
                        <td className="py-2">{t.status ? 'Active' : 'Inactive'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for profile transactions */}
            {txData && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Show</span>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={txPageSize}
                    onChange={(e) => { setTxPageSize(Number(e.target.value)); setTxPage(1); }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span className="text-sm">entries</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setTxPage(txPage - 1)} disabled={txPage <= 1}>Previous</Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, txData.totalPages || 1) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min((txData.totalPages || 1) - 4, txPage - 2)) + i;
                      if (pageNum > (txData.totalPages || 1)) return null;
                      return (
                        <Button key={pageNum} variant={txPage === pageNum ? 'default' : 'outline'} size="sm" className="w-8 h-8 p-0" onClick={() => setTxPage(pageNum)}>
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setTxPage(txPage + 1)} disabled={txPage >= (txData.totalPages || 1)}>Next</Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  {`Showing ${((txPage - 1) * txPageSize) + 1} to ${Math.min(txPage * txPageSize, txData?.totalItems || 0)} of ${txData?.totalItems || 0} entries`}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination Controls - Only show when there are results */}
      {profilesData?.success !== false && !error && (
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
          {isLoading ? (
            "Loading..."
          ) : (
            `Showing ${((currentPage - 1) * pageSize) + 1} to ${Math.min(currentPage * pageSize, totalItems)} of ${totalItems} entries`
          )}
        </div>
      </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProfile(null); // Reset selected profile
          queryClient.invalidateQueries({ queryKey: ["profiles"] });
        }}
        profile={selectedProfile}
        onSubmit={() => {}} // ProfileModal handles its own API calls
      />

      {/* Profile Details Modal */}
      <ProfileDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDetailsProfile(null);
        }}
        profile={detailsProfile}
      />
    </div>
  );
}
