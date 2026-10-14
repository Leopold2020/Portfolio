const BASE_URL = "http://localhost:3000";

const USER_DATA = {
  dateOfBirth: "1965-03-15",
  displayName: "Michael",
  email: "manager@dundermifflin.com",
  password: "threatlevelmidnight",
  username: "michaelscott",
};

try {
  const signUpResponse = await fetch(`${BASE_URL}/api/auth/sign-up`, {
    body: JSON.stringify(USER_DATA),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const signUpData = await signUpResponse.json();

  if (!signUpResponse.ok) {
    console.error("Failed to create user:", signUpData);
    process.exit(1);
  }

  console.log("User created:", signUpData);

  const signInResponse = await fetch(`${BASE_URL}/api/auth/sign-in`, {
    body: JSON.stringify({ password: USER_DATA.password, username: USER_DATA.username }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const signInData = await signInResponse.json();

  if (!signInResponse.ok) {
    console.error("Failed to sign in:", signInData);
    process.exit(1);
  }

  console.log("Token:", signInData.token);
} catch (error) {
  throw new Error(`Could not reach the server: ${error.message}`);
}
