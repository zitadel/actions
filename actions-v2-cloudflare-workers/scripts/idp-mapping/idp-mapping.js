export default {
  async fetch(req, env) {
    // --- Path validation ---
    const url = new URL(req.url);
    if (req.method !== "POST" || url.pathname !== "/") {
      return new Response("Not found", { status: 404 });
    }

    if (!env.SIGNING_KEY) {
      console.error("[Init] Missing SIGNING_KEY in environment");
      return new Response("Missing signing key", { status: 500 });
    }

    const signatureHeader = req.headers.get("zitadel-signature");
    if (!signatureHeader) {
      console.warn("[Verify] Missing signature header");
      return new Response("Missing signature", { status: 400 });
    }

    // --- Parse and verify signature ---
    const rawBody = await req.text();
    const isValid = await verifySignature(signatureHeader, rawBody, env.SIGNING_KEY);
    if (!isValid) {
      console.warn("[Verify] Invalid signature");
      return new Response("Invalid signature", { status: 400 });
    }

    // --- Parse and process request ---
    let jsonBody;
    try {
      jsonBody = JSON.parse(rawBody);
    } catch {
      console.error("[Parse] Invalid JSON body");
      return new Response("Invalid JSON body", { status: 400 });
    }

    const receivedObject = jsonBody.response;
    if (!receivedObject) {
      console.error("[Parse] Missing response object");
      return new Response("Missing response object", { status: 400 });
    }

    console.log("[Input] Received object:", JSON.stringify(receivedObject));

    // --- Map IDP attributes if applicable ---
    mapIdpAttributes(receivedObject, env.IDP_ID_1, env.IDP_ID_2);

    console.log("[Output] Returned object:", JSON.stringify(receivedObject));

    // --- Return the modified response ---
    return jsonResponse(receivedObject);
  },
};

// --- Helper Functions ---

/**
 * Verify HMAC signature from Zitadel
 */
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
  if (!isMatch) {
    console.warn("[Verify] Signature mismatch");
  }

  return isMatch;
}

/**
 * Map IDP attributes based on provider ID
 */
function mapIdpAttributes(receivedObject, IDP_ID_1, IDP_ID_2) {
  const idpInfo = receivedObject.idpInformation;
  if (!idpInfo || !idpInfo.rawInformation) return;

  const idpAttributes = idpInfo.rawInformation;
  const idpId = idpInfo.idpId;

  if (idpId === IDP_ID_1 && receivedObject.addHumanUser) {
    const attrs = idpAttributes.attributes;
    receivedObject.addHumanUser.email = {
      isVerified: true,
      email: attrs.Email?.[0],
    };
    receivedObject.addHumanUser.username = attrs.UserName?.[0];
    receivedObject.addHumanUser.profile = {
      givenName: attrs.FirstName?.[0],
      familyName: attrs.SurName?.[0],
      nickName: attrs.FullName?.[0],
      displayName: attrs.FullName?.[0],
    };
    receivedObject.addHumanUser.idpLinks[0].userName = attrs.Email?.[0];
    console.log("[Mapping] Attributes mapped for SAML provider");
  }

  else if (idpId === IDP_ID_2 && receivedObject.addHumanUser) {
    receivedObject.addHumanUser.email = {
      isVerified: idpAttributes.email_verified,
      email: idpAttributes.email,
    };
    receivedObject.addHumanUser.username = `${idpAttributes.sub}_test`;
    receivedObject.addHumanUser.profile = {
      givenName: idpAttributes.given_name,
      familyName: idpAttributes.family_name,
      nickName: idpAttributes.nickname,
      displayName: idpAttributes.name,
    };
    console.log("[Mapping] Attributes mapped for OIDC provider");
  }
}

/**
 * Helper for JSON responses
 */
function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
