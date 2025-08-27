import { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
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
import { mockProfiles } from "@/lib/mock-data";
import { type Profile, type InsertProfile } from "@shared/schema";

export default function Profiles() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProfiles = mockProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.phone.includes(searchTerm);
    const matchesType = typeFilter === "all" || profile.type === typeFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && profile.isActive) ||
                         (statusFilter === "inactive" && !profile.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddProfile = () => {
    setSelectedProfile(null);
    setIsModalOpen(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };

  const handleSubmitProfile = (data: InsertProfile) => {
    console.log("Profile submitted:", data);
    // In a real app, this would call an API
  };

  const handleDeleteProfile = (profileId: string) => {
    console.log("Delete profile:", profileId);
    // In a real app, this would call an API
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="profiles-search-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
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
        data={filteredProfiles}
        columns={columns}
        testId="profiles-table"
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitProfile}
        profile={selectedProfile}
      />
    </div>
  );
}
