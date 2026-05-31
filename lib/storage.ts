import { createSupabaseAdminClient } from "@/lib/supabase"

const PRODUCT_IMAGES_BUCKET = "product-images"
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"])
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

function getFileExtension(fileName: string, mimeType: string) {
  const fromName = fileName.split(".").pop()?.toLowerCase()

  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName
  }

  switch (mimeType) {
    case "image/png":
      return "png"
    case "image/jpeg":
      return "jpg"
    case "image/webp":
      return "webp"
    default:
      return "bin"
  }
}

function ensureValidImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Formato no permitido. Usa PNG, JPG o WEBP.")
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("La imagen supera el límite de 5 MB.")
  }
}

export async function uploadProductImage({
  branchSlug,
  productId,
  file,
}: {
  branchSlug: string
  productId: string
  file: File
}) {
  ensureValidImage(file)

  const supabase = createSupabaseAdminClient()
  const extension = getFileExtension(file.name, file.type)
  const filePath = `${branchSlug}/${productId}-${Date.now()}.${extension}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filePath, fileBuffer, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data: publicUrlData } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(filePath)

  const { data, error: updateError } = await supabase
    .from("products")
    .update({ image_url: publicUrlData.publicUrl, updated_at: new Date().toISOString() })
    .eq("id", productId)
    .eq("branch_id", branchSlug)
    .select("id, image_url")
    .single()

  if (updateError) {
    throw updateError
  }

  return data
}
