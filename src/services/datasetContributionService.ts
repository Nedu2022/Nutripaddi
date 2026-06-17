import { assertSupabaseConfigured, supabase } from "@/src/lib/supabase";
import { uploadImage } from "@/src/services/uploadService";

type SubmitDatasetContributionInput = {
  imageUri: string;
  imageName?: string;
  foodName: string;
  category?: string;
  note?: string;
  consent: boolean;
};

export async function submitDatasetContribution({
  imageUri,
  imageName,
  foodName,
  category,
  note,
  consent,
}: SubmitDatasetContributionInput) {
  assertSupabaseConfigured();

  if (!consent) throw new Error("Consent is required before submitting.");

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("You need to be signed in to submit a contribution.");
  }

  const image = await uploadImage({
    fileName: imageName,
    folder: "dataset",
    uri: imageUri,
  });

  const { error } = await supabase.from("dataset_contributions").insert({
    category,
    consent,
    food_name: foodName,
    image_public_id: image.publicId,
    image_url: image.secureUrl ?? image.url,
    note,
    status: "submitted",
    user_id: userData.user.id,
  });

  if (error) throw new Error(error.message);

  return image;
}
