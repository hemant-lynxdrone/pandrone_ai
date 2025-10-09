const AUTH_URL = import.meta.env.VITE_AUTH_URL as string;
const STREAM_URL = import.meta.env.VITE_STREAM_URL as string;
const BASIC_TOKEN = import.meta.env.VITE_BASIC_TOKEN as string;
const LIVEKIT_WS = import.meta.env.VITE_LIVEKIT_WS as string;

export async function getAccessToken() {
  const resp = await fetch(AUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${BASIC_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      resource: STREAM_URL,
      scope: "read:jwt",
    }),
  });

  if (!resp.ok) throw new Error("Failed to get access token");
  const data = await resp.json();
  return data.access_token;
}

export async function getLiveKitJWT(accessToken: string) {
  const resp = await fetch(STREAM_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      number: "+33789103035",
      location: { lat: 44.759137, long: -0.672353 },
    }),
  });

  if (!resp.ok) throw new Error("Failed to get JWT");
  return resp.json();
}

export { LIVEKIT_WS };
