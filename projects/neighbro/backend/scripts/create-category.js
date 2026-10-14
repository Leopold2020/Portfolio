const BASE_URL = "http://localhost:3000";

// Paste the JWT you got from "create-user.js" here
const TOKEN = "";

if (!TOKEN) {
  console.error("Token is missing, run create-user.js to get a user token");
  process.exit(1);
}

const CATEGORY_DATA = {
  description: "Gambling, games of chance or simply betting. Are you getting lucky tonight?",
  name: "Gambling",
};

try {
  const response = await fetch(`${BASE_URL}/api/event-categories`, {
    body: JSON.stringify(CATEGORY_DATA),
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const data = await response.json();

  if (response.ok) {
    console.log("Category created:", data);
    console.log("Category UUID:", data.data.id);
  } else {
    console.error("Failed to create category:", data);
    process.exit(1);
  }
} catch (error) {
  throw new Error(`Could not reach the server: ${error.message}`);
}
