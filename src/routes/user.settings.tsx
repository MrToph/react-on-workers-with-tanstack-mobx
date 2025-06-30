import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { observer } from "mobx-react-lite";
import { useStore } from "@/store/use-store";

function SettingsComponent() {
  const [userStore] = useStore((store) => [store.userStore]);

  console.log(
    userStore.userInfoResult.data,
    userStore.userInfoResult.data?.user
  );
  const { userInfoResult, username } = userStore;

  const credentials = userInfoResult.data?.user.credentials;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings and passkeys.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="username" className="text-lg">
              Username
            </Label>
            <p
              id="username"
              className="text-lg font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md"
            >
              {username}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-lg">Passkeys</Label>
            <div className="border rounded-md p-4 space-y-3">
              {credentials && credentials.length > 0 ? (
                credentials.map((credential) => (
                  <div
                    key={credential.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {credential.authenticatorInfo?.icon_light && (
                        <img
                          src={credential.authenticatorInfo.icon_light}
                          alt={credential.authenticatorInfo.name}
                          className="h-8 w-8"
                        />
                      )}
                      <span className="font-medium">
                        {credential.authenticatorInfo?.name ?? "Passkey"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      ID: ...{credential.id.slice(-8)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No passkeys registered.
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Add additional passkey</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/user/settings")({
  component: observer(SettingsComponent),
});
