import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Shield, Loader2 } from "lucide-react";

type AppRole = "admin" | "moderator" | "user";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  roles: AppRole[];
}

export function RoleManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Record<string, AppRole>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsersWithRoles = async () => {
    setLoading(true);
    
    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name");
    
    if (profilesError) {
      toast({ title: "Error fetching users", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Fetch all roles
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      toast({ title: "Error fetching roles", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Map roles to users
    const usersWithRoles = profiles?.map(profile => ({
      ...profile,
      roles: roles
        ?.filter(r => r.user_id === profile.id)
        .map(r => r.role as AppRole) || []
    })) || [];

    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  const assignRole = async (userId: string) => {
    const role = selectedRole[userId];
    if (!role) return;

    setActionLoading(`assign-${userId}`);
    
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role });

    if (error) {
      if (error.code === "23505") {
        toast({ title: "User already has this role", variant: "destructive" });
      } else {
        toast({ title: "Error assigning role", variant: "destructive" });
      }
    } else {
      toast({ title: "Role assigned successfully" });
      fetchUsersWithRoles();
    }
    
    setSelectedRole(prev => ({ ...prev, [userId]: undefined as any }));
    setActionLoading(null);
  };

  const revokeRole = async (userId: string, role: AppRole) => {
    setActionLoading(`revoke-${userId}-${role}`);
    
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) {
      toast({ title: "Error revoking role", variant: "destructive" });
    } else {
      toast({ title: "Role revoked successfully" });
      fetchUsersWithRoles();
    }
    
    setActionLoading(null);
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "admin": return "destructive";
      case "moderator": return "default";
      case "user": return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No users found in the system.
          </CardContent>
        </Card>
      ) : (
        users.map(user => (
          <Card key={user.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{user.full_name || "No name"}</CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {user.roles.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No roles assigned</span>
                ) : (
                  user.roles.map(role => (
                    <Badge 
                      key={role} 
                      variant={getRoleBadgeVariant(role)}
                      className="flex items-center gap-1"
                    >
                      {role}
                      <button
                        onClick={() => revokeRole(user.id, role)}
                        disabled={actionLoading === `revoke-${user.id}-${role}`}
                        className="ml-1 hover:bg-background/20 rounded p-0.5"
                      >
                        {actionLoading === `revoke-${user.id}-${role}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>
                    </Badge>
                  ))
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Select
                  value={selectedRole[user.id] || ""}
                  onValueChange={(value) => setSelectedRole(prev => ({ ...prev, [user.id]: value as AppRole }))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => assignRole(user.id)}
                  disabled={!selectedRole[user.id] || actionLoading === `assign-${user.id}`}
                >
                  {actionLoading === `assign-${user.id}` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
