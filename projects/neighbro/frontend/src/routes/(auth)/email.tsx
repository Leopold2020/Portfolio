import { createFileRoute } from "@tanstack/react-router";

function EmailSentPage() {
  return (
    <div>
      <h1>We sent you a verification email</h1>
      <p>Check your inbox</p>
    </div>
  );
}

export const Route = createFileRoute("/(auth)/email")({
  component: EmailSentPage,
});
