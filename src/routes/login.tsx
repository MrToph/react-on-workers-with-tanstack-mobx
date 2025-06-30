import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { observer } from "mobx-react-lite";
import { useStore } from "@/store/use-store";
import { LoginFormState } from "@/store/auth";

function LoginComponent() {
  const authStore = useStore((store) => store.authStore);

  const title =
    authStore.loginForm.state === LoginFormState.Register ? "Sign Up" : "Login";
  const buttonText =
    authStore.loginForm.state === LoginFormState.Register ? "Sign Up" : "Login";
  const toggleText =
    authStore.loginForm.state === LoginFormState.Register
      ? "Already have an account? Login"
      : "Don't have an account? Sign Up";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>
            Enter your username below to {title.toLowerCase()}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
                    <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="username"
              value={authStore.loginForm.username}
              onChange={(e) => authStore.formUsernameChange(e.target.value)}
            />
          </div>
          {authStore.isFormSubmissionError && (
            <p className="text-sm text-red-500">
              {authStore.formSubmissionError?.message}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button
            className="w-full"
            onClick={authStore.formSubmit}
            disabled={!authStore.formCanSubmit || authStore.formSubmissionLoading}
          >
            {authStore.formSubmissionLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {buttonText}
          </Button>
          <Button
            variant="link"
            onClick={authStore.formToggle}
            className="mt-4"
          >
            {toggleText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/login")({
  component: observer(LoginComponent),
});
