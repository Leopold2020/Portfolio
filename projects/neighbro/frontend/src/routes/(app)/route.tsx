import { createFileRoute, isRedirect, Outlet, redirect } from "@tanstack/react-router";
import { fetchMe } from "@/api/me";
import Layout from "@/components/Layout";
import NavBar from "@/components/NavBar";

export const Route = createFileRoute("/(app)")({
  // This makes everything in (app) a protected route
  // user needs to be authenticated
  beforeLoad: async ({ context }) => {
    try {
      // TODO: Verify session
      // right now we just check if a token exist
      if (!context.token) {
        throw redirect({
          search: { redirect: location.pathname },
          to: "/signin",
        });
      }
      const { queryClient, token } = context;

      // Fetch user data and ensure it's cached for other usages
      // provides userId for all child routes
      const meData = await queryClient.ensureQueryData({
        queryFn: () => fetchMe(token),
        queryKey: ["user", "me"],
      });

      // Update context with userId and non null token
      return {
        ...context,
        token: context.token,
        userId: meData.id,
      };
    } catch (error) {
      // Copied from tanstack router docs
      // Re-throw redirects (they're intentional, not errors)
      if (isRedirect(error)) throw error;

      // Auth check failed (network error, etc.) - redirect to login
      throw redirect({
        search: { redirect: location.pathname },
        to: "/signin",
      });
    }
  },
  component: LayoutComponent,
});

// This file will be the layout for everyting in (app) folder
// basically a __root but for this folder
// This is usefull for seperating layouts for certain paths
// We could have a navbar that shows here but then doesn't for the auth pages or about pages

function LayoutComponent() {
  return (
    <>
      <Layout>
        {/* padding bottom to ensure content is never hidden behind navbar */}
        <div className="pb-20">
          <Outlet />
        </div>
      </Layout>
      {/* NavBar outside Layout - fixed position works better */}
      <NavBar />
    </>
  );
}
