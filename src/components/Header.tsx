import { Server, LogIn, LogOut, User, Users } from "lucide-react";
import { Link } from "react-router-dom";
import AddDeviceDialog from "./AddDeviceDialog";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been signed out.",
      });
    }
  };

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Server className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground glow-text">
                Device Manager
              </h1>
              <p className="text-xs text-muted-foreground">
                Software Version Tracker
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Show Add Device and User Management only for admins */}
            {isAdmin && (
              <>
                <Button variant="brightsign" size="sm" asChild>
                  <Link to="/admin/users">
                    <Users className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Users</span>
                  </Link>
                </Button>
                <AddDeviceDialog />
              </>
            )}
            
            {/* Auth controls */}
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{user.email}</span>
                      {isAdmin && (
                        <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth">
                    <Button variant="brightsign" size="sm">
                      <LogIn className="w-4 h-4 mr-1" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
