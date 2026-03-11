import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2 } from "lucide-react";

interface UserWithRole {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export function RoleManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getSessionToken = () => localStorage.getItem("barclays_session_token");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-clients", {
        body: { session_token: getSessionToken(), action: "list-clients" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setUsers((data.clients || []).map((c: any) => ({
        id: c.id,
        email: c.email,
        name: c.name,
        role: c.role,
      })));
    } catch (err: any) {
      toast({ title: "Error fetching users", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateRole = async (userId: string, role: string) => {
    setActionLoading(userId);
    try {
      const { data, error } = await supabase.functions.invoke("admin-clients", {
        body: { session_token: getSessionToken(), action: "update-role", user_id: userId, role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: `Role updated to ${role}` });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error updating role", description: err.message, variant: "destructive" });
    }
    setSelectedRole((prev) => ({ ...prev, [userId]: "" }));
    setActionLoading(null);
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === "admin") return "destructive" as const;
    return "secondary" as const;
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
        users.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.name || "No name"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                    {user.role}
                  </Badge>
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={selectedRole[user.id] || ""}
                  onValueChange={(value) => setSelectedRole((prev) => ({ ...prev, [user.id]: value }))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Change role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => updateRole(user.id, selectedRole[user.id])}
                  disabled={!selectedRole[user.id] || actionLoading === user.id}
                >
                  {actionLoading === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
