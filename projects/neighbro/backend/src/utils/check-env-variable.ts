export function checkForEnvVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not set in the .env file`);
  }
  return value;
}
