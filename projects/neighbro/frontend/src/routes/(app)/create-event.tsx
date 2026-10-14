import { createFileRoute } from "@tanstack/react-router";
import { fetchCategories } from "@/api/categories";
import CreateEventForm from "../../components/CreateEventForm";

export const Route = createFileRoute("/(app)/create-event")({
  component: RouteComponent,
  loader: async ({ context }) => {
    const { queryClient, token } = context;

    return await queryClient.ensureQueryData({
      queryFn: () => fetchCategories(token),
      queryKey: ["categories"],
    });
  },
});

function RouteComponent() {
  const { data } = Route.useLoaderData() as Awaited<ReturnType<typeof fetchCategories>>;
  return <CreateEventForm categories={data} />;
}
