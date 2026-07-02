import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock } from "lucide-react";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

const ResetPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event fired when the recovery link is clicked
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsRecoverySession(true);
          setChecking(false);
        }
      }
    );

    // Also check if there's already a session (link already processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      const hash = window.location.hash;
      if (session && (hash.includes("type=recovery") || hash.includes("access_token"))) {
        setIsRecoverySession(true);
      } else if (session) {
        // Session exists but not from recovery — still allow updating password if user is signed in
        setIsRecoverySession(true);
      }
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });
    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Failed to update password",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password updated",
      description: "You can now sign in with your new password.",
    });
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-foreground">
            Set a new password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isRecoverySession
              ? "Enter your new password below."
              : "Invalid or expired reset link. Please request a new one."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRecoverySession ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        New password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-input border-border text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Confirm password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-input border-border text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  Update password
                </Button>
              </form>
            </Form>
          ) : (
            <Button
              className="w-full"
              onClick={() => navigate("/forgot-password")}
            >
              Request a new reset link
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
