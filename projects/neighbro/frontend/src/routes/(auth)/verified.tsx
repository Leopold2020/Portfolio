import { createFileRoute } from "@tanstack/react-router";

function VerifiedPage() {
  return (
    <div>
      <h1>Your account is now verified</h1>
    </div>
  );
}

export const Route = createFileRoute("/(auth)/verified")({
  component: VerifiedPage,
});
