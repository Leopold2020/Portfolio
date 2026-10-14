import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
}

interface AuthActions {
  signOut: () => void;
  setAuth: (token: AuthState["token"]) => void;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>()(
  // TODO: using the default storage (localStorage) is vulnerable to XSS attacks
  persist(
    (set) => ({
      setAuth: (token) => set({ token }),
      // Sign out: clears token
      // TODO: Token needs to be invalidated on the server
      signOut: () => set({ token: null }),
      token: null,
    }),
    {
      name: "auth",
    },
  ),
);

export default useAuthStore;
