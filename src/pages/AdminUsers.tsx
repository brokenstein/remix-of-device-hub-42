import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Shield, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  user_id: string;
  email: string | null;
  display_name: string | null;
  isAdmin: boolean;
}

const AdminUsers = () => {
  const { user, isAdmin, isLoading: authLoading, isRoleLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || isRoleLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, isRoleLoading, navigate]);

  const loadUsers = async () => {
    setIsLoading(true);
    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] =
      await Promise.all([
        supabase.from("profiles").select("user_id, email, display_name"),
        supabase.from("user_roles").select("user_id, role"),
      ]);

    if (pErr || rErr) {
      toast.error("Failed to load users");
      setIsLoading(false);
      return;
    }

    const adminIds = new Set(
      (roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id)
    );

    setUsers(
      (profiles ?? []).map((p) => ({
        user_id: p.user_id,
        email: p.email,
        display_name: p.display_name,
        isAdmin: adminIds.has(p.user_id),
      }))
    );
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  const toggleAdmin = async (targetUserId: string, makeAdmin: boolean) => {
    if (targetUserId === user?.id) {
      toast.error("You cannot change your own admin status");
      return;
    }

    setUpdatingId(targetUserId);
    try {
      if (makeAdmin) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: targetUserId, role: "admin" });
        if (error && !error.message.includes("duplicate")) throw error;
        toast.success("User promoted to admin");
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", targetUserId)
          .eq("role", "admin");
        if (error) throw error;
        toast.success("Admin role removed");
      }
      await loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background dark">
        <Header />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">
            User Management
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              All Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {users.map((u) => (
                <div
                  key={u.user_id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {u.email || "No email"}
                        {u.user_id === user?.id && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </p>
                      {u.isAdmin && (
                        <span className="text-xs text-primary">Admin</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Admin
                    </span>
                    <Switch
                      checked={u.isAdmin}
                      disabled={
                        updatingId === u.user_id || u.user_id === user?.id
                      }
                      onCheckedChange={(checked) =>
                        toggleAdmin(u.user_id, checked)
                      }
                    />
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No users found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Devices
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
