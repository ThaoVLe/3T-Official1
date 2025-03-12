import * as React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';

const AUTH_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  React.useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const loginTimestamp = localStorage.getItem("loginTimestamp");

    if (storedEmail && loginTimestamp) {
      const timeSinceLogin = Date.now() - parseInt(loginTimestamp);
      if (timeSinceLogin <= AUTH_TIMEOUT) {
        navigate("/home");
      } else {
        // Clear expired session
        localStorage.removeItem("userEmail");
        localStorage.removeItem("loginTimestamp");
      }
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

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

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
      setIsLoading(false);
    }
  };

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
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Continue with Email"}
          </Button>
        </form>
      </Card>
    </div>
  );
}