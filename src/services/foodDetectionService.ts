import { assertSupabaseConfigured, supabase } from "@/src/lib/supabase";
import type { FoodDetectionResult } from "@/src/types/detection";

export async function detectFoodFromImage(
  imageUri: string
): Promise<FoodDetectionResult> {
  if (!imageUri) return { imageQuality: "poor", summary: null };

  assertSupabaseConfigured();

  const formData = new FormData();
  formData.append("file", {
    name: imageUri.split("/").pop() || `meal-scan-${Date.now()}.jpg`,
    type: "image/jpeg",
    uri: imageUri,
  } as unknown as Blob);

  const { data, error } = await supabase.functions.invoke<FoodDetectionResult>(
    "detect-food",
    {
      body: formData,
    }
  );

  if (error) throw new Error(error.message);
  return data ?? { imageQuality: "poor", summary: null };
}
