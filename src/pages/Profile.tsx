
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";

const Profile = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <UserCircle className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl font-medium">{user?.name}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
              <Badge variant={isAdmin ? "default" : "outline"}>
                {isAdmin ? "Admin" : "Agent"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Account Settings</h4>
            <p className="text-sm text-muted-foreground">
              This is where you can change your account settings and preferences.
              This feature will be available soon with Supabase integration.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled>
            Edit Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;
