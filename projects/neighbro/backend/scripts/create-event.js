const BASE_URL = "http://localhost:3000";

// Paste the token you got from "create-user.js" here
const TOKEN = "";

if (!TOKEN) {
  console.error("Token is missing, run create-user.js to get a user token");
  process.exit(1);
}

// Paste the UUID you got from "create-category.js" in categories (or remove it and it default to an empty array)

const EVENT_DATA = {
  address: "1725 Slough Avenue, Scranton, PA 18503",
  categories: "",
  description: "Welcome to Dunder Mifflin's charity casino night, where the stakes are high! Maybe too high...",
  endTime: "2026-12-20T22:00:00.000Z",
  latitude: 41.4993,
  longitude: -75.6603,
  name: "Casino Night",
  startTime: "2026-12-20T18:00:00.000Z",
};

try {
  const response = await fetch(`${BASE_URL}/api/events`, {
    body: JSON.stringify(EVENT_DATA),
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const data = await response.json();

  if (response.ok) {
    console.log("Event created:", data);
  } else {
    console.error("Failed to create event:", data);
    process.exit(1);
  }
} catch (error) {
  throw new Error(`Could not reach the server: ${error.message}`);
}
