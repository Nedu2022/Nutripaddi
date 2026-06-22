import { assertSupabaseConfigured, supabase } from "@/src/lib/supabase";
import { getProfileScanContext } from "@/src/services/coachService";
import { prepareImageForUpload } from "@/src/services/imageService";
import type { FoodDetectionResult } from "@/src/types/detection";

export async function detectFoodFromImage(
  imageUri: string
): Promise<FoodDetectionResult> {
  if (!imageUri) return { imageQuality: "poor", summary: null };

  assertSupabaseConfigured();

  const [{ base64, mimeType }, scanContext] = await Promise.all([
    prepareImageForUpload(imageUri, 1600),
    getProfileScanContext().catch(() => ({
      profileContext: null,
      userStatus: "other" as const,
    })),
  ]);

  if (!base64) return { imageQuality: "poor", summary: null };

  const fileName = imageUri.split("/").pop() || `meal-scan-${Date.now()}.jpg`;

  const { data, error } = await supabase.functions.invoke<FoodDetectionResult>(
    "detect-food",
    {
      body: {
        fileName,
        image: base64,
        mimeType,
        profileContext: scanContext.profileContext,
        user_status: scanContext.userStatus,
      },
    }
  );

  if (error) throw new Error(error.message);
  return data ?? { imageQuality: "poor", summary: null };
}
