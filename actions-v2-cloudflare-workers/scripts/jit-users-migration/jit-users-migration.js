export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // --- Validate environment variables ---
    const {
      ZITADEL_DOMAIN,
      ACCESS_TOKEN,
      ZITADEL_ORG_ID,
      SETSESSION_SIGNING_KEY,
      LISTUSERS_SIGNING_KEY,
      SETPASSWORD_SIGNING_KEY
    } = env;

    const missing = [];
    if (!ZITADEL_DOMAIN) missing.push("ZITADEL_DOMAIN");
    if (!ACCESS_TOKEN) missing.push("ACCESS_TOKEN");
    if (!ZITADEL_ORG_ID) missing.push("ZITADEL_ORG_ID");
    if (!SETSESSION_SIGNING_KEY) missing.push("SETSESSION_SIGNING_KEY");
    if (!LISTUSERS_SIGNING_KEY) missing.push("LISTUSERS_SIGNING_KEY");
    if (!SETPASSWORD_SIGNING_KEY) missing.push("SETPASSWORD_SIGNING_KEY");

    if (missing.length > 0) {
      console.error("[Init] Missing environment variables:", missing.join(", "));
      return new Response("Missing configuration", { status: 500 });
    }

    // --- Route dispatch ---
    if (url.pathname === "/action/list-users") {
      return handleListUsers(req, env);
    }

    if (url.pathname === "/action/set-session") {
      return handleSetSession(req, env);
    }

    if (url.pathname === "/action/set-password") {
      return handleSetPassword(req, env);
    }

    return new Response("Not found", { status: 404 });
  },
};

// --- Shared Helpers ---

async function readJsonBody(req) {
  const rawBody = await req.text();
  let jsonBody;
  try {
    jsonBody = JSON.parse(rawBody);
  } catch {
    throw new Error("Invalid JSON body");
  }
  return { rawBody, jsonBody };
}

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

  const isMatch = computedSignature === signature;
  if (!isMatch) console.warn("[Verify] Signature mismatch");

  return isMatch;
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// --- Simple random password generator ---
function generateRandomPassword() {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let pw = "";
  for (let i = 0; i < 10; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
}

// --- Mock Legacy DB ---
const LEGACY_DB = {
  "legacy-user": {
    userId: "db-163840776835432346",
    username: "legacy-user",
    givenName: "Legacy",
    familyName: "User",
    displayName: "Legacy User",
    preferredLanguage: "en",
    email: "legacy-user@gmail.com",
    password: "Password1!",
  },
};

// --- Helper Function ---
/**
 * Retrieves and checks user metadata for migration status.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{ migrated: boolean, metadata: Array }>} - Migration status and metadata.
 */
async function getUserMigrationMetadata(userId) {
  const metadataSearchBody = {
    filters: [
      {
        keyFilter: {
          key: "migratedFromLegacy",
          method: "TEXT_FILTER_METHOD_EQUALS"
        }
      }
    ]
  };

  const metadataSearchResponse = await fetch(`/v2/users/${userId}/metadata/search`, {
    method: 'POST',
    body: JSON.stringify(metadataSearchBody),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const metadata = (await metadataSearchResponse.json()).metadata || [];
  const migratedMetadata = metadata.find(m => m.key === 'migratedFromLegacy');
  const migratedValue = migratedMetadata ? Buffer.from(migratedMetadata.value, 'base64').toString('utf8') : null;

  return {
    migrated: migratedValue === 'true',
    metadata
  };
}

// --- Handlers ---

async function handleListUsers(req, env) {
  const { ZITADEL_DOMAIN, ACCESS_TOKEN, ZITADEL_ORG_ID, LISTUSERS_SIGNING_KEY } = env;

  try {
    const signatureHeader = req.headers.get("zitadel-signature");
    if (!signatureHeader) return new Response("Missing signature", { status: 400 });

    const { rawBody, jsonBody } = await readJsonBody(req);

    const isValid = await verifySignature(signatureHeader, rawBody, LISTUSERS_SIGNING_KEY);
    if (!isValid) return new Response("Invalid signature", { status: 403 });

    const body = jsonBody;
    const resp = body.response || {};
    const userID = body.userID;

    if (userID !== "zitadel-cloud-login") {
      console.log("[ListUsers] Ignoring request not from hosted login page");
      return jsonResponse(resp);
    }

    const total = Number(resp?.details?.totalResult || 0);
    if (total > 0) {
      console.log("[ListUsers] User already found, skipping migration");
      return jsonResponse(resp);
    }

    const loginName = body?.request?.queries?.[0]?.loginNameQuery?.loginName;
    if (!loginName || !LEGACY_DB[loginName]) {
      console.log("[ListUsers] No legacy user found for loginName:", loginName);
      return jsonResponse(resp);
    }

    const legacy = LEGACY_DB[loginName];

    const createResp = await fetch(`https://${ZITADEL_DOMAIN}/v2/users/new`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        organizationId: ZITADEL_ORG_ID,
        userId: legacy.userId,
        username: legacy.username,
        human: {
          profile: {
            givenName: legacy.givenName,
            familyName: legacy.familyName,
            displayName: legacy.displayName,
            preferredLanguage: legacy.preferredLanguage || "en",
          },
          email: { email: legacy.email, isVerified: true },
          password: { password: generateRandomPassword(), changeRequired: false },
          metadata: [{ key: "migratedFromLegacy", value: btoa("migrating") }],
        },
      }),
    });

    const created = await createResp.json();

    const userSearch = await fetch(`https://${ZITADEL_DOMAIN}/v2/users/${created.id}`, {
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const userData = await userSearch.json();
    const u = userData.user || {};

    return jsonResponse({
      details: { totalResult: "1", timestamp: new Date().toISOString() },
      result: [
        {
          userId: u.userId,
          details: u.details,
          state: u.state || "USER_STATE_ACTIVE",
          username: u.username,
          loginNames: u.loginNames || [loginName],
          preferredLoginName: u.preferredLoginName || loginName,
          human: u.human,
        },
      ],
    });
  } catch (err) {
    console.error("[ListUsers] Error:", err);
    return jsonResponse({ error: err.message }, 200);
  }
}

async function handleSetSession(req, env) {
  const { ZITADEL_DOMAIN, ACCESS_TOKEN, SETSESSION_SIGNING_KEY } = env;

  try {
    const signatureHeader = req.headers.get("zitadel-signature");
    if (!signatureHeader) return new Response("Missing signature", { status: 400 });

    const { rawBody, jsonBody } = await readJsonBody(req);

    const isValid = await verifySignature(signatureHeader, rawBody, SETSESSION_SIGNING_KEY);
    if (!isValid) return new Response("Invalid signature", { status: 403 });

    const { request: reqBody, response } = jsonBody;
    const pw = reqBody?.checks?.password?.password;
    const sessionId = reqBody?.sessionId;
    const sessionToken = reqBody?.sessionToken;
    if (!pw) {
      console.log("No password received.");
      return jsonResponse(response || {});
    }

    const sessionRes = await fetch(
      `https://${ZITADEL_DOMAIN}/v2/sessions/${sessionId}?sessionToken=${encodeURIComponent(sessionToken)}`,
      {
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const search = await sessionRes.json();
    const userId = search?.session?.factors?.user?.id;
    const legacyLoginName = search?.session?.factors?.user?.loginName;

    const { migrated, metadata } = await getUserMigrationMetadata(userId);

    if (migrated) {
      console.log("[SetSession] Skipping, already migrated");
      return jsonResponse(response || {});
    }

    if (metadata.length === 0) {
      console.log("[SetSession] No metadata found, skipping password update");
      return jsonResponse(response || {});
    }

    const legacy = LEGACY_DB[legacyLoginName];
    if (!legacy || pw !== legacy.password) {
      console.log("Wrong username or password. Please try again.");
      console.log("legacyLoginName", legacyLoginName);
      console.log("legacy:", JSON.stringify(legacy));
      console.log("pw:", pw);
      return jsonResponse({
        forwardedStatusCode: 400,
        forwardedErrorMessage: "Wrong username or password. Please try again.",
      }, 200);
    }

    // Set user password
    await fetch(`https://${ZITADEL_DOMAIN}/v2/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        human: { password: { password: { password: pw, changeRequired: false } } },
      }),
    });

    // Update metadata
    await fetch(`https://${ZITADEL_DOMAIN}/v2/users/${userId}/metadata`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metadata: [{ key: "migratedFromLegacy", value: btoa("true") }],
      }),
    });

    return jsonResponse(response || {});
  } catch (err) {
    console.error("[SetSession] Error:", err);
    return jsonResponse({ error: err.message }, 200);
  }
}

async function handleSetPassword(req, env) {
  const { ZITADEL_DOMAIN, ACCESS_TOKEN, SETPASSWORD_SIGNING_KEY } = env;

  try {
    const signatureHeader = req.headers.get("zitadel-signature");
    if (!signatureHeader) return new Response("Missing signature", { status: 400 });

    const { rawBody, jsonBody } = await readJsonBody(req);

    const isValid = await verifySignature(signatureHeader, rawBody, SETPASSWORD_SIGNING_KEY);
    if (!isValid) return new Response("Invalid signature", { status: 403 });

    const { request, response } = jsonBody || {};
    const userId = request?.userId;

    if (!userId) {
      console.error('Missing userId in SetPassword request');
      return jsonResponse({ error: 'Missing userId in request' }, 400);
    }

    const { migrated, metadata } = await getUserMigrationMetadata(userId);

    if (migrated) {
      console.info('User already migrated, skipping password set for user:', userId);
      return jsonResponse(response || {});
    }
    if (metadata.length === 0) {
      console.info('No migration metadata found, skipping password set for user:', userId);
      return jsonResponse(response || {});
    }

    console.info('SetPassword action successful, updating metadata for user:', userId);
    await fetch(`https://${ZITADEL_DOMAIN}/v2/users/${userId}/metadata`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        metadata: [{ key: "migratedFromLegacy", value: Buffer.from("true").toString("base64") }]
      })
    });

    return jsonResponse(response || {});
  } catch (e) {
    console.error('SetPassword action error:', e);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
