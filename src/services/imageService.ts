import { Platform } from "react-native";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

export type PreparedImage = {
  base64: string;
  mimeType: string;
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(blob);
  });
}

async function rawBase64(uri: string): Promise<PreparedImage> {
  const blob = await (await fetch(uri)).blob();
  return { base64: await blobToBase64(blob), mimeType: blob.type || "image/jpeg" };
}

const JPEG_QUALITY = 0.96;

function resizeWebToBase64(uri: string, maxWidth: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / (img.width || maxWidth));
        const width = Math.max(1, Math.round((img.width || maxWidth) * scale));
        const height = Math.max(1, Math.round((img.height || maxWidth) * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve("");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY).split(",")[1] ?? "");
      } catch {
        resolve("");
      }
    };
    img.onerror = () => resolve("");
    img.src = uri;
  });
}

export async function prepareImageForUpload(
  uri: string,
  maxWidth = 1280
): Promise<PreparedImage> {
  if (Platform.OS === "web") {
    const base64 = await resizeWebToBase64(uri, maxWidth);
    if (base64) return { base64, mimeType: "image/jpeg" };
    return rawBase64(uri);
  }

  try {
    const context = ImageManipulator.manipulate(uri);
    context.resize({ width: maxWidth });
    const image = await context.renderAsync();
    const result = await image.saveAsync({
      base64: true,
      compress: JPEG_QUALITY,
      format: SaveFormat.JPEG,
    });
    if (result.base64) return { base64: result.base64, mimeType: "image/jpeg" };
  } catch {
  }

  return rawBase64(uri);
}
