
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "You are now logged in",
      });
      navigate("/");
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Invalid email or password");
      toast({
        title: "Error",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md w-full p-8">
        <div className="flex flex-col space-y-2 text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to sign in to your account
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errorMessage}
            </div>
          )}
        
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="underline underline-offset-4 hover:text-primary">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
