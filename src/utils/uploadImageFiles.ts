
import { supabase } from "@/integrations/supabase/client";

export async function uploadImageFiles({
  files,
  userId,
  folder,
}: {
  files: File[];
  userId: string;
  folder: string;
}): Promise<{ publicUrls: string[]; errors: string[] }> {
  const publicUrls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file);

      if (uploadError) {
        errors.push(`Failed to upload ${file.name}: ${uploadError.message}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("project-images")
        .getPublicUrl(filePath);

      publicUrls.push(publicUrl);
    } catch (e: any) {
      errors.push(`Failed to upload ${file.name}: ${e.message}`);
    }
  }
  return { publicUrls, errors };
}
