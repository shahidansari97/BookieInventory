import { 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  TrendingUpIcon,
  Eye 
} from "lucide-react";
import StatCard from "@/components/cards/stat-card";
import DataTable from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Transaction, type Profile } from "@shared/schema";
import { useMemo, useState, useEffect } from "react";
import axios from "@/config/axiosInstance";
import { API } from "@/config/apiEndpoints";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Safe data fetching with error handling
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    retry: 1,
    retryDelay: 1000,
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
    retry: 1,
    retryDelay: 1000,
  });

  // Fetch uplink profiles for dropdown with error handling
  const { data: uplinkProfiles = [], error: uplinkProfilesError } = useQuery<any[]>({
    queryKey: ["uplink-profiles-all"],
    queryFn: async () => {
      try {
        console.log('Fetching uplink profiles...');
        const response = await axios.get(API.UPLINK_PROFILES_ALL);
        console.log('Uplink profiles response:', response.data);
        
        const payload = response.data;
        const arr = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];
        return arr;
      } catch (error: any) {
        console.error('Uplink profiles API error:', error);
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Safe array normalization
  const uplinkProfilesArray: any[] = Array.isArray(uplinkProfiles) ? uplinkProfiles : [];

  // Select first uplink profile by default when list loads (only if profiles are available)
  useEffect(() => {
    try {
      if (!selectedProfileId && uplinkProfilesArray.length > 0) {
        const firstProfile = uplinkProfilesArray[0];
        if (firstProfile && firstProfile.id) {
          console.log('Setting default profile:', firstProfile.id);
          setSelectedProfileId(firstProfile.id);
        }
      } else if (uplinkProfilesArray.length === 0 && selectedProfileId) {
        // Clear selection if no profiles are available
        console.log('No uplink profiles available, clearing selection');
        setSelectedProfileId(null);
      }
    } catch (error) {
      console.error('Error setting default profile:', error);
    }
  }, [uplinkProfilesArray, selectedProfileId]);

  // Safe profile selection
  const selectedProfile = uplinkProfilesArray.find(p => p && p.id === selectedProfileId);
  const selectedProfileName = selectedProfile?.name || 
    (uplinkProfilesArray.length === 0 ? "No Uplink Profiles" : "Select Profile");
  
  // Safe effective profile ID
  const effectiveSelectedProfileId = selectedProfileId || (uplinkProfilesArray.length > 0 ? uplinkProfilesArray[0]?.id : null);

  // Fetch dashboard data with error handling
  const { data: profileDashboard, isLoading: profileDashboardLoading, error: profileDashboardError } = useQuery<any | null>({
    queryKey: ["dashboard-index", effectiveSelectedProfileId],
    queryFn: async () => {
      try {
        if (!effectiveSelectedProfileId) {
          return null;
        }
        
        console.log('Fetching dashboard for profileId:', effectiveSelectedProfileId);
        const response = await axios.post(API.DASHBOARD_INDEX, { profileId: effectiveSelectedProfileId });
        console.log('Dashboard API response:', response.data);
        
        if (response.data?.success && response.data?.data) {
          return response.data.data;
        }
        return null;
      } catch (error: any) {
        console.error('Dashboard API error:', error);
        return null;
      }
    },
    enabled: !!effectiveSelectedProfileId,
    retry: 1,
    retryDelay: 1000,
  });

  // Safe stats calculation
  const stats = useMemo(() => {
    try {
      // If no profile is selected, show empty state
      if (!effectiveSelectedProfileId) {
        return {
          totalTransactions: 0,
          totalAmount: 0,
          uplinksCount: 0,
          downlinesCount: 0,
          recentTransactions: [],
          outstandingBalance: 0,
          totalTakenAmount: 0,
          totalGivenAmount: 0,
        };
      }

      // If profile is selected and we have dashboard data, use it
      if (profileDashboard && typeof profileDashboard === 'object') {
        const latest = Array.isArray(profileDashboard.latestTransactions) ? profileDashboard.latestTransactions : [];
        
        return {
          totalTransactions: latest.length,
          totalAmount: (Number(profileDashboard.totalTakenAmount) || 0) + (Number(profileDashboard.totalGivenAmount) || 0),
          uplinksCount: 0,
          downlinesCount: 0,
          recentTransactions: latest,
          outstandingBalance: Number(profileDashboard.outstandingBalance) || 0,
          totalTakenAmount: Number(profileDashboard.totalTakenAmount) || 0,
          totalGivenAmount: Number(profileDashboard.totalGivenAmount) || 0,
        };
      }

      // If profile is selected but no dashboard data yet, show empty state
      return {
        totalTransactions: 0,
        totalAmount: 0,
        uplinksCount: 0,
        downlinesCount: 0,
        recentTransactions: [],
        outstandingBalance: 0,
        totalTakenAmount: 0,
        totalGivenAmount: 0,
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalTransactions: 0,
        totalAmount: 0,
        uplinksCount: 0,
        downlinesCount: 0,
        recentTransactions: [],
        outstandingBalance: 0,
        totalTakenAmount: 0,
        totalGivenAmount: 0,
      };
    }
  }, [effectiveSelectedProfileId, profileDashboard]);

  // Safe date formatting
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "-";
      
      const iso = new Date(dateString);
      if (!isNaN(iso.getTime())) {
        return iso.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        });
      }
      
      const short = dateString.match(/^(\d{2})-(\d{2})-(\d{2})$/);
      if (short) {
        const dd = Number(short[1]);
        const mm = Number(short[2]);
        const yy = 2000 + Number(short[3]);
        return new Date(yy, mm - 1, dd).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        });
      }
      
      const long = dateString.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      if (long) {
        const dd = Number(long[1]);
        const mm = Number(long[2]);
        const yyyy = Number(long[3]);
        return new Date(yyyy, mm - 1, dd).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        });
      }
      
      return "-";
    } catch {
      return "-";
    }
  };

  // Safe column definitions
  const columns = [
    {
      key: "date",
      title: "Date",
      render: (value: any) => {
        try {
          const str = value instanceof Date ? value.toISOString() : String(value || "");
          return formatDate(str);
        } catch {
          return "-";
        }
      },
    },
    {
      key: "transactionType",
      title: "Type",
      render: (value: string) => {
        try {
          return (
            <Badge 
              variant={value === "UPLINK" ? "default" : "secondary"}
              className={
                value === "UPLINK" 
                  ? "bg-primary/10 text-primary" 
                  : "bg-green-100 text-green-600"
              }
            >
              {value === "UPLINK" ? (
                <>
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Taken
                </>
              ) : (
                <>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Given
                </>
              )}
            </Badge>
          );
        } catch {
          return <span>-</span>;
        }
      },
    },
    {
      key: "profileInfo",
      title: "Profile",
      render: (value: any) => {
        try {
          return value?.name || "Unknown";
        } catch {
          return "Unknown";
        }
      },
    },
    {
      key: "amount",
      title: "Amount",
      align: "right" as const,
      render: (value: number) => {
        try {
          return (value || 0).toLocaleString("en-IN");
        } catch {
          return "0";
        }
      },
    },
    {
      key: "totalAmount",
      title: "Total",
      align: "right" as const,
      render: (value: number) => {
        try {
          return `₹${(value || 0).toLocaleString("en-IN")}`;
        } catch {
          return "₹0";
        }
      },
    },
  ];

  // Safe click handlers
  const handleViewAllClick = () => {
    try {
      console.log('View All button clicked - navigating to /transactions');
      setLocation("/transactions");
    } catch (error) {
      console.error('Error navigating to transactions:', error);
    }
  };

  const handleProfileSelect = (profileId: string) => {
    try {
      if (profileId) {
        setSelectedProfileId(profileId);
      }
    } catch (error) {
      console.error('Error selecting profile:', error);
    }
  };

  // Show error if uplink profiles fail to load
  if (uplinkProfilesError) {
    return (
      <div className="p-4 md:p-6" data-testid="dashboard-page">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-destructive">Error Loading Profiles</h2>
          <p className="text-muted-foreground mb-4">
            Failed to load uplink profiles. Please check the console for details.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Show empty state if no uplink profiles are available
  if (uplinkProfilesArray.length === 0 && !profilesLoading) {
    return (
      <div className="p-4 md:p-6" data-testid="dashboard-page">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2" data-testid="dashboard-title">
              Dashboard
            </h2>
            <p className="text-muted-foreground" data-testid="dashboard-description">
              Overview of your inventory management system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Selected Profile:</span>
            <Button className="bg-gray-400 text-white cursor-not-allowed" disabled>
              No Uplink Profiles
            </Button>
          </div>
        </div>
        
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Uplink Profiles Available</h3>
          <p className="text-muted-foreground mb-4">
            You need to have uplink profiles to view dashboard data. Please contact your administrator to set up uplink profiles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6" data-testid="dashboard-page">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2" data-testid="dashboard-title">
            Dashboard
          </h2>
          <p className="text-muted-foreground" data-testid="dashboard-description">
            Overview of your inventory management system
          </p>
        </div>
        {/* Exchange user list dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Selected Profile:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                {selectedProfileName}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Dynamic Uplink profiles */}
              {uplinkProfilesArray.length > 0 ? (
                uplinkProfilesArray.map((p: any) => {
                  if (!p || typeof p !== 'object' || !p.id) return null;
                  return (
                    <DropdownMenuItem 
                      key={p.id} 
                      onClick={() => handleProfileSelect(p.id)}
                      className={selectedProfileId === p.id ? "bg-blue-50 font-semibold" : ""}
                    >
                      {p.name || 'Unknown Profile'}
                      {selectedProfileId === p.id && (
                        <span className="ml-auto text-blue-600">✓</span>
                      )}
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <DropdownMenuItem disabled>No Uplink Profiles</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Transactions"
          value={profileDashboardLoading ? "..." : String(stats.totalTransactions)}
          icon={Clock}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
          valueColor="text-primary"
        />
        <StatCard
          title="Total Amount"
          value={profileDashboardLoading ? "..." : `₹${stats.totalAmount.toLocaleString("en-IN")}`}
          icon={TrendingUpIcon}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          valueColor="text-green-600"
        />
        <StatCard
          title="Taken Amount"
          value={profileDashboardLoading ? "..." : `₹${stats.totalTakenAmount.toLocaleString("en-IN")}`}
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          valueColor="text-blue-600"
        />
        <StatCard
          title="Outstanding Balance"
          value={profileDashboardLoading ? "..." : `₹${stats.outstandingBalance.toLocaleString("en-IN")}`}
          icon={TrendingDown}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          valueColor="text-purple-600"
        />
      </div>

      {/* Recent Transactions */}
      <Card data-testid="recent-transactions-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle data-testid="recent-transactions-title">
              Recent Transactions
            </CardTitle>
            <Button
              variant="outline"
              onClick={handleViewAllClick}
              data-testid="view-all-transactions-button"
              className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
            >
              <Eye className="w-4 h-4" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {profileDashboardLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-muted-foreground">Loading profile data...</p>
              </div>
            </div>
          ) : profileDashboardError ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-destructive text-lg mb-2">Error loading profile data</p>
                <p className="text-sm text-muted-foreground">Please try selecting another profile</p>
              </div>
            </div>
          ) : stats.recentTransactions.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-muted-foreground text-lg mb-2">No transactions found</p>
                <p className="text-sm text-muted-foreground">This profile has no recent transactions</p>
              </div>
            </div>
          ) : (
            <DataTable
              data={stats.recentTransactions}
              columns={columns}
              itemsPerPage={10}
              testId="recent-transactions-table"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}