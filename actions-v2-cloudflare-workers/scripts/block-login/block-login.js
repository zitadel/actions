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

        // --- Read body and verify signature ---
        const rawBody = await req.text();
        const isValid = await verifySignature(signatureHeader, rawBody, env.SIGNING_KEY);
        if (!isValid) {
            console.warn("[Verify] Invalid signature");
            return new Response("Invalid signature", { status: 400 });
        }

        // --- Parse JSON body ---
        let jsonBody;
        try {
            jsonBody = JSON.parse(rawBody);
        } catch {
            console.error("[Parse] Invalid JSON body");
            return new Response("Invalid JSON body", { status: 400 });
        }

        console.log("[Input] Received body:", JSON.stringify(jsonBody));

        const blocked = isUserBlocked(jsonBody);

        if (blocked) {
            const response = {
                forwardedStatusCode: 403,
                forwardedErrorMessage: "This user has been blocked",
            };
            console.log("[Output] Returned body:", JSON.stringify(response));
            return jsonResponse(response);
        } else {
            console.log("[Output] Returned body:", JSON.stringify(jsonBody));
            return jsonResponse(jsonBody);
        }

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
    if (!isMatch) console.warn("[Verify] Signature mismatch");

    return isMatch;
}

/**
 * Check if the user has been blocked in metadata
 * If the metadata contains a "blocked" key with a value of "true", the user is considered blocked.
 */

function isUserBlocked(jsonBody) {
    if (!jsonBody?.user_metadata || !Array.isArray(jsonBody.user_metadata)) return false;

    for (const item of jsonBody.user_metadata) {
        if (item.key === "blocked") {
            // Decode Base64 safely
            let decoded;
            try {
                decoded = atob(item.value).trim();
            } catch {
                console.warn("[Decode] Invalid Base64 in blocked metadata");
                continue;
            }

            if (decoded.toLowerCase() === "true") {
                return true;
            }
        }
    }

    return false;
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