import { useState } from "react";
import { UserPlus, Edit, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/tables/data-table";
import UserModal from "@/components/modals/user-modal";
import { mockUsers } from "@/lib/mock-data";
import { type User, type InsertUser } from "@shared/schema";

export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSubmitUser = (data: InsertUser) => {
    console.log("User submitted:", data);
    // In a real app, this would call an API
  };

  const handleToggleUserStatus = (userId: string) => {
    console.log("Toggle user status:", userId);
    // In a real app, this would call an API
  };

  const formatLastLogin = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleDateString("en-IN") + " " + date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    {
      key: "username",
      title: "Username",
      render: (value: string) => (
        <div className="font-medium" data-testid={`user-username-${value}`}>
          {value}
        </div>
      ),
    },
    {
      key: "role",
      title: "Role",
      render: (value: string) => (
        <Badge 
          variant={value === "bookie" ? "default" : "secondary"}
          className={
            value === "bookie" 
              ? "bg-primary/10 text-primary" 
              : "bg-secondary/50 text-secondary-foreground"
          }
          data-testid={`user-role-${value}`}
        >
          {value === "bookie" ? "Bookie" : "Assistant"}
        </Badge>
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
      key: "lastLogin",
      title: "Last Login",
      render: (value: Date | null) => (
        <div className="text-sm" data-testid="user-last-login">
          {formatLastLogin(value)}
        </div>
      ),
    },
    {
      key: "isActive",
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
          {row.username !== "admin" && (
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

  return (
    <div className="p-4 md:p-6" data-testid="users-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2" data-testid="users-title">
            User Management
          </h2>
          <p className="text-muted-foreground" data-testid="users-description">
            Manage system users and permissions
          </p>
        </div>
        <Button
          onClick={handleAddUser}
          className="mt-4 md:mt-0"
          data-testid="add-user-button"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <DataTable
        data={mockUsers}
        columns={columns}
        testId="users-table"
      />

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitUser}
        user={selectedUser}
      />
    </div>
  );
}
