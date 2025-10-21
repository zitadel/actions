export default {
    async fetch(req, env) {
        const url = new URL(req.url);

        // --- Validate endpoint ---
        if (req.method !== "POST" || url.pathname !== "/") {
            return new Response("Not found", { status: 404 });
        }

        // --- Validate env vars ---
        const { SIGNING_KEY, DD_URL, DD_API_KEY } = env;
        if (!SIGNING_KEY || !DD_URL || !DD_API_KEY) {
            console.error("[Init] Missing environment variables");
            return new Response("Missing configuration", { status: 500 });
        }

        // --- Validate signature header ---
        const signatureHeader = req.headers.get("zitadel-signature");
        if (!signatureHeader) {
            console.warn("[Verify] Missing signature header");
            return new Response("Missing signature", { status: 400 });
        }

        // --- Read body ---
        const rawBody = await req.text();

        // --- Verify signature ---
        const isValid = await verifySignature(signatureHeader, rawBody, SIGNING_KEY);
        if (!isValid) {
            console.warn("[Verify] Invalid signature");
            return new Response("Invalid signature", { status: 400 });
        }

        // --- Parse JSON ---
        let jsonBody;
        try {
            jsonBody = JSON.parse(rawBody);
        } catch {
            console.error("[Parse] Invalid JSON");
            return new Response("Invalid JSON", { status: 400 });
        }

        console.log("[Input] Received Zitadel event:", JSON.stringify(jsonBody));

        // --- Forward to DD ---
        try {
            await sendToDD(jsonBody, DD_URL, DD_API_KEY);
        } catch (err) {
            console.error("[Forward] Failed to send to DD:", err);
            // Still return 200 to Zitadel — we don’t want retries to pile up
        }

        // --- Respond to Zitadel ---
        return new Response("Event processed", { status: 200 });
    },
};

// --- Verify Zitadel signature ---
async function verifySignature(signatureHeader, rawBody, signingKey) {
    const parts = signatureHeader.split(",");
    const timestamp = parts.find(p => p.startsWith("t="))?.split("=")[1];
    const signature = parts.find(p => p.startsWith("v1="))?.split("=")[1];
    if (!timestamp || !signature) return false;

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

// --- Send data to DD via HEC ---
async function sendToDD(data, url, api_key) {

    const logItem = {
      ddsource: "cloudflare-worker",
      service: "zitadel-forwarder",
      hostname: "cloudflare",
      message: JSON.stringify(data),
      // include any custom attributes
      attributes: {}
    };

    const endpoint = `${url}/api/v2/logs`;
    console.log("[Forward] Sending to:", endpoint);

    let res;
    try {
        res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "DD-API-KEY": api_key
            },
            body: JSON.stringify([logItem]),
        });
    } catch (err) {
        console.error("[Forward] Network error:", err);
        throw err;
    }

    const text = await res.text(); // always read body for more info
    if (!res.ok) {
        console.error(`[Forward] DD returned HTTP ${res.status}`);
        throw new Error(`DD returned ${res.status}`);
    }

    console.log("[Forward] Successfully sent to DD");
    return text;
}

