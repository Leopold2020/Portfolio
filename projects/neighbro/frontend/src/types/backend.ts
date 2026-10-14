export interface User {
  avatarId: number | null;
  bio: string | null;
  dateOfBirth: string;
  email: string;
  eventsJoined: number;
  id: string;
  joinedAt: string;
  lastActiveAt: null | string;
  displayName: null | string;
  username: string;
  verifiedAt: null | string;
}

export interface authSignUp {
  username: string;
  password: string;
  email: string;
  displayName: string;
  dateOfBirth: string;
}

export interface authSignIn {
  username: string;
  password: string;
}
