import { createFileRoute } from "@tanstack/react-router";
import { fetchMe } from "@/api/me";
import { fetchUserById } from "@/api/users";
import { ProfilePage } from "@/components/ProfilePage";
import type { User } from "@/types/backend";

export const Route = createFileRoute("/(app)/profile/$userId")({
  component: RouteComponent,
  // TODO: Need to expand on this later, maybe a generic error component
  errorComponent: ({ error, reset }) => {
    return (
      <div className="grid justify-items-center">
        {error.message}
        <button
          className="border"
          onClick={() => {
            // Reset the router error boundary
            reset();
          }}
          type="button"
        >
          retry
        </button>
      </div>
    );
  },
  loader: async ({ context, params: { userId } }) => {
    const { queryClient, userId: loggedInUserId } = context;

    const isOwnProfile = userId === loggedInUserId;

    const fetchProfile = async () => {
      if (isOwnProfile) {
        return await queryClient.ensureQueryData({
          queryFn: () => fetchMe(context.token),
          queryKey: ["user", "me"],
        });
      } else {
        return await queryClient.ensureQueryData({
          queryFn: () => fetchUserById(userId, context.token),
          queryKey: ["user", userId],
        });
      }
    };
    const profileData = await fetchProfile();
    return { isOwnProfile, profileData };
  },
  onError: (error) => console.error(error),
  // TODO: replace with a skeleton of profile
  pendingComponent: () => <div>Loading...</div>,
});

function RouteComponent() {
  // can't get to it to infer types here, so I explicitly cast it
  // maybe vscode users have better luck with this
  const { profileData, isOwnProfile } = Route.useLoaderData() as { profileData: User; isOwnProfile: boolean };
  return (
    <div>
      <ProfilePage
        mode={isOwnProfile ? "owner" : "view"}
        user={{
          avatarId: profileData?.avatarId || null,
          bio: profileData?.bio,
          dateOfBirth: profileData?.dateOfBirth,
          displayName: profileData?.displayName,
          email: profileData?.email,
          id: profileData?.id,
          username: profileData?.username,
        }}
      ></ProfilePage>
    </div>
  );
}
