import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Redirect to profile by default
    // TODO: Redirect to discover page when that exists
    throw redirect({ to: "/profile" });
  },
});
