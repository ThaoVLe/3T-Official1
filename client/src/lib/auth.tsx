import { ReactNode } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function AuthRequired({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const userEmail = localStorage.getItem("userEmail");

  if (!userEmail) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">Enter your email to continue</p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem("email") as HTMLInputElement).value;

              if (!email) {
                toast({
                  title: "Error",
                  description: "Please enter your email",
                  variant: "destructive",
                });
                return;
              }

              try {
                const response = await fetch("/api/auth/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });

                if (!response.ok) throw new Error("Login failed");

                const user = await response.json();
                localStorage.setItem("userEmail", user.email);
                window.location.reload();
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to log in. Please try again.",
                  variant: "destructive",
                });
              }
            }}
            className="space-y-4"
          >
            <Input type="email" name="email" placeholder="Enter your email" required />
            <Button type="submit" className="w-full">
              Continue with Email
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
