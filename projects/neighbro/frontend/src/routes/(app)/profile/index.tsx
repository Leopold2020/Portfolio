import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/profile/")({
  beforeLoad: ({ context }) => {
    // get the user's id from the context in (app)
    const { userId } = context;
    // redirect to the user's profile page at their id
    throw redirect({
      params: { id: userId },
      to: "/profile/$id",
    });
  },
});
