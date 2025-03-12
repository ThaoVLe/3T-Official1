import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

const AUTH_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export function AuthRequired({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const loginTimestamp = localStorage.getItem("loginTimestamp");

    if (!userEmail || !loginTimestamp) {
      // No user info, show login
      navigate("/auth");
      return;
    }

    const timeSinceLogin = Date.now() - parseInt(loginTimestamp);
    if (timeSinceLogin > AUTH_TIMEOUT) {
      // Login expired, clear storage
      localStorage.removeItem("userEmail");
      localStorage.removeItem("loginTimestamp");
      navigate("/auth");
      return;
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Login failed");

      const user = await response.json();
      localStorage.setItem("userEmail", user.email.toLowerCase());
      localStorage.setItem("loginTimestamp", Date.now().toString());
      navigate("/home");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const userEmail = localStorage.getItem("userEmail");
  const loginTimestamp = localStorage.getItem("loginTimestamp");
  const isValidSession = userEmail && loginTimestamp && 
    (Date.now() - parseInt(loginTimestamp)) <= AUTH_TIMEOUT;

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-6 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to continue to your diary
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoggingIn}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? "Logging in..." : "Continue with Email"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}