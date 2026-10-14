import { createFileRoute, Outlet } from "@tanstack/react-router";
import Layout from "@/components/Layout";

export const Route = createFileRoute("/(auth)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
