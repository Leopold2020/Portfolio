import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import useAuthStore from "@/stores/authStore";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: () => {
    const { token } = useAuthStore.getState();
    return { token };
  },
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return <Outlet />;
}

// Can be moved to a component file later if we want
function NotFoundComponent() {
  return <div>Error: 404 Not Found</div>;
}
