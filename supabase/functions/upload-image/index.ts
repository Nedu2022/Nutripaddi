// @ts-nocheck
const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

function getEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

async function sha1(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const cloudName = getEnv("CLOUDINARY_CLOUD_NAME");
    const apiKey = getEnv("CLOUDINARY_API_KEY");
    const apiSecret = getEnv("CLOUDINARY_API_SECRET");
    const incoming = await request.formData();
    const file = incoming.get("file");
    const folder = String(incoming.get("folder") || "meals");

    if (!file) {
      return Response.json(
        { message: "Missing file." },
        { headers: corsHeaders, status: 400 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const cloudinaryFolder = `nutripaddi/${folder}`;
    const signature = await sha1(
      `folder=${cloudinaryFolder}&timestamp=${timestamp}${apiSecret}`
    );

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", apiKey);
    body.append("timestamp", timestamp);
    body.append("folder", cloudinaryFolder);
    body.append("signature", signature);

    const upload = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        body,
        method: "POST",
      }
    );
    const result = await upload.json();

    if (!upload.ok) {
      return Response.json(result, {
        headers: corsHeaders,
        status: upload.status,
      });
    }

    return Response.json(
      {
        image: {
          height: result.height,
          publicId: result.public_id,
          secureUrl: result.secure_url,
          url: result.url,
          width: result.width,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "Upload failed." },
      { headers: corsHeaders, status: 500 }
    );
  }
});
