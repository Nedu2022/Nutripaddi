// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

const BUCKET = "uploads";

function fileExtension(name: string, mimeType: string) {
  const fromName = name.includes(".") ? name.split(".").pop() : "";
  if (fromName) return fromName.toLowerCase();
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
}

function base64ToBytes(b64: string) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function readUpload(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    const image = typeof body.image === "string" ? body.image : "";
    const folder = typeof body.folder === "string" ? body.folder : "meals";
    if (!image) return { file: null, folder };
    const mimeType = typeof body.mimeType === "string" ? body.mimeType : "image/jpeg";
    const fileName = typeof body.fileName === "string" ? body.fileName : "upload.jpg";
    const file = new File([base64ToBytes(image)], fileName, { type: mimeType });
    return { file, folder };
  }
  const form = await request.formData();
  const f = form.get("file");
  return { file: f instanceof File ? f : null, folder: String(form.get("folder") || "meals") };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      throw new Error("Supabase environment is not configured.");
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { file, folder } = await readUpload(request);

    if (!(file instanceof File)) {
      return Response.json(
        { message: "Missing file." },
        { headers: corsHeaders, status: 400 }
      );
    }

    await supabase.storage.createBucket(BUCKET, { public: true });

    const ext = fileExtension(file.name, file.type);
    const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      return Response.json(
        { message: uploadError.message },
        { headers: corsHeaders, status: 500 }
      );
    }

    const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return Response.json(
      {
        image: {
          publicId: path,
          secureUrl: publicUrl.publicUrl,
          url: publicUrl.publicUrl,
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
