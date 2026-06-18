import { assertSupabaseConfigured, supabase } from "@/src/lib/supabase";
import { prepareImageForUpload } from "@/src/services/imageService";

export type UploadedImage = {
  id?: string;
  url: string;
  secureUrl?: string;
  publicId?: string;
  width?: number;
  height?: number;
};

type UploadImageOptions = {
  uri: string;
  folder?: "profiles" | "meals" | "dataset";
  fileName?: string;
  mimeType?: string;
};

type UploadResponse = {
  id?: string;
  image?: UploadedImage;
  upload?: UploadedImage;
  url?: string;
  secureUrl?: string;
  secure_url?: string;
  publicId?: string;
  public_id?: string;
  width?: number;
  height?: number;
};

function getFileName(uri: string, fallback?: string) {
  if (fallback) return fallback;
  const uriName = uri.split("/").pop();
  return uriName || `nutripaddi-upload-${Date.now()}.jpg`;
}

function normalizeUploadResponse(response: UploadResponse): UploadedImage {
  const image = response.image ?? response.upload ?? response;
  const url = image.secureUrl ?? image.url ?? response.secure_url ?? response.url;

  if (!url) {
    throw new Error("The upload response did not include an image URL.");
  }

  return {
    height: image.height,
    id: image.id,
    publicId: image.publicId ?? response.public_id,
    secureUrl: image.secureUrl ?? response.secure_url,
    url,
    width: image.width,
  };
}

export async function uploadImage({
  uri,
  folder = "meals",
  fileName,
}: UploadImageOptions) {
  assertSupabaseConfigured();

  const name = getFileName(uri, fileName);
  const { base64, mimeType } = await prepareImageForUpload(uri, 1280);

  const { data, error } = await supabase.functions.invoke<UploadResponse>(
    "upload-image",
    {
      body: { fileName: name, folder, image: base64, mimeType },
    }
  );

  if (error) throw new Error(error.message);
  return normalizeUploadResponse(data ?? {});
}
