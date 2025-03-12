import { useState } from "react";
import { useLocation } from "wouter";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in successfully");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("User created successfully");
      }
      navigate("/home");
    } catch (error: any) {
      console.error("Authentication error:", error);
      let errorMessage = "Failed to authenticate";

      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/operation-not-allowed':
          errorMessage = "Email/Password sign-in is not enabled. Please contact support or try again in a few minutes.";
          break;
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered. Try logging in instead.";
          setIsLogin(true); // Automatically switch to login mode
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password should be at least 6 characters long.";
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = "Invalid email or password.";
          break;
        default:
          errorMessage = error.message || "Authentication failed. Please try again.";
      }

      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  {isLogin ? "Logging in..." : "Signing up..."}
                </div>
              ) : (
                isLogin ? "Log In" : "Sign Up"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setPassword('');
              }}
              disabled={loading}
            >
              {isLogin ? "Need an account? Sign up" : "Have an account? Log in"}
            </Button>
            {isLogin && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => window.location.href = "/new"}
                disabled={loading}
              >
                Create First Entry
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}