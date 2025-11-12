export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method !== "POST" || url.pathname !== "/") {
      return new Response("Not found", { status: 404 });
    }

    const {
      SET_ROLE_SIGNING_KEY,
      ACCESS_TOKEN,
      ZITADEL_DOMAIN,
      PROJECT_ID,
      ROLE_KEYS
    } = env;

    const missing = [];
    if (!SET_ROLE_SIGNING_KEY) missing.push("SET_ROLE_SIGNING_KEY");
    if (!ACCESS_TOKEN) missing.push("ACCESS_TOKEN");
    if (!ZITADEL_DOMAIN) missing.push("ZITADEL_DOMAIN");
    if (!PROJECT_ID) missing.push("PROJECT_ID");
    if (!ROLE_KEYS) missing.push("ROLE_KEYS");

    if (missing.length > 0) {
      console.error("[Init] Missing environment variables:", missing.join(", "));
      return new Response("Missing configuration", { status: 500 });
    }

    const signatureHeader = req.headers.get("zitadel-signature");
    if (!signatureHeader) {
      console.warn("[Verify] Missing signature header");
      return new Response("Missing signature", { status: 400 });
    }

    const rawBody = await req.text();
    const isValid = await verifySignature(signatureHeader, rawBody, SET_ROLE_SIGNING_KEY);
    if (!isValid) {
      console.warn("[Verify] Invalid signature");
      return new Response("Invalid signature", { status: 400 });
    }

    let jsonBody;
    try {
      jsonBody = JSON.parse(rawBody);
    } catch {
      console.error("[Parse] Invalid JSON body");
      return new Response("Invalid JSON body", { status: 400 });
    }

    try {
      const { resourceOwner, aggregateID } = jsonBody || {};
      const userId = aggregateID;
      const organizationId = resourceOwner;
      const roleKeys = ROLE_KEYS.split(",").map(k => k.trim()).filter(k => k.length > 0);

      if (!userId || !PROJECT_ID || !organizationId || roleKeys.length === 0) {
        console.error("Missing required parameters for set-role action");
        return new Response("Missing required parameters", { status: 400 });
      }

      const createAuthPayload = {
        userId,
        projectId: PROJECT_ID,
        organizationId,
        roleKeys
      };

      console.info("Creating authorization for user:", createAuthPayload);

      const response = await fetch(
        `https://${ZITADEL_DOMAIN}/zitadel.authorization.v2.AuthorizationService/CreateAuthorization`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createAuthPayload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create authorization:", response.status, errorText);
        return new Response("Failed to create authorization", { status: 500 });
      }

      console.info("Authorization created successfully for user:", userId);
      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Error in set-role action:", error);
      return new Response("Internal server error", { status: 500 });
    }
  },
};

async function verifySignature(signatureHeader, rawBody, signingKey) {
  const elements = signatureHeader.split(",");
  const timestamp = elements.find(e => e.startsWith("t="))?.split("=")[1];
  const signature = elements.find(e => e.startsWith("v1="))?.split("=")[1];

  if (!timestamp || !signature) {
    console.warn("[Verify] Malformed signature header");
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(signingKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const computedSignature = Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return computedSignature === signature;
}
