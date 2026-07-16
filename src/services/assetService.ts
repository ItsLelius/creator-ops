import { supabase } from "../lib/supabase";
import type { AssetDbItem, AssetType } from "../types";

const ASSET_BUCKET = "asset-library";

export type CreateAssetInput = {
  contentPageId: string;
  type: AssetType;
  title: string;
  content: string;
  description: string;
};

export type UpdateAssetInput = CreateAssetInput & {
  id: string;
};

type AssetStorageReference = {
  id: string;
  type: AssetType;
  file_path: string | null;
};

export async function getAssets() {
  const { data, error } = await supabase
    .from("asset_library")
    .select(
      `
      id,
      content_page_id,
      title,
      category,
      type,
      content,
      description,
      file_path,
      file_name,
      file_size,
      mime_type,
      created_by,
      created_at,
      updated_at,
      content_page:content_pages!asset_library_content_page_id_fkey (
        id,
        name,
        platform,
        page_url,
        niche,
        status
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as AssetDbItem[];

  return Promise.all(
    rows.map(async (asset) => {
      const fileUrl = asset.file_path
        ? await createSignedAssetUrl(asset.file_path)
        : null;

      return {
        ...asset,
        file_url: fileUrl,
      };
    }),
  );
}

export async function createAsset(input: CreateAssetInput, file?: File | null) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("You must be logged in.");
  }

  let filePath: string | null = null;
  let fileName = "";
  let fileSize = 0;
  let mimeType = "";

  if (input.type === "image" || input.type === "pdf") {
    if (!file) {
      throw new Error(`${assetTypeLabel(input.type)} file is required.`);
    }

    validateAssetFile(input.type, file);

    filePath = buildAssetFilePath(input.contentPageId, input.type, file.name);
    fileName = file.name;
    fileSize = file.size;
    mimeType = file.type || fallbackMimeType(input.type);

    const { error: uploadError } = await supabase.storage
      .from(ASSET_BUCKET)
      .upload(filePath, file, {
        contentType: mimeType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }
  }

  if (input.type === "text" && !input.content.trim()) {
    throw new Error("Text content is required.");
  }

  const { data, error } = await supabase
    .from("asset_library")
    .insert({
      content_page_id: input.contentPageId,
      title: input.title.trim(),
      category: input.type,
      type: input.type,
      content: input.type === "text" ? input.content.trim() : "",
      description: input.description.trim(),
      file_path: filePath,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    if (filePath) {
      await supabase.storage.from(ASSET_BUCKET).remove([filePath]);
    }

    throw new Error(error.message);
  }

  return data;
}

export async function updateAsset(input: UpdateAssetInput, file?: File | null) {
  const currentAsset = await getAssetStorageReference(input.id);

  let nextFilePath: string | null = currentAsset.file_path;
  let nextFileName: string | undefined;
  let nextFileSize: number | undefined;
  let nextMimeType: string | undefined;
  let uploadedReplacementPath: string | null = null;
  let oldFileToRemove: string | null = null;

  const nextTypeNeedsFile = input.type === "image" || input.type === "pdf";

  if (nextTypeNeedsFile) {
    const typeChanged = currentAsset.type !== input.type;

    if (file) {
      validateAssetFile(input.type, file);

      nextFilePath = buildAssetFilePath(input.contentPageId, input.type, file.name);
      nextFileName = file.name;
      nextFileSize = file.size;
      nextMimeType = file.type || fallbackMimeType(input.type);
      uploadedReplacementPath = nextFilePath;

      const { error: uploadError } = await supabase.storage
        .from(ASSET_BUCKET)
        .upload(nextFilePath, file, {
          contentType: nextMimeType,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      if (currentAsset.file_path) {
        oldFileToRemove = currentAsset.file_path;
      }
    } else if (typeChanged || !currentAsset.file_path) {
      throw new Error(`Choose a ${assetTypeLabel(input.type)} file.`);
    }
  }

  if (input.type === "text") {
    if (!input.content.trim()) {
      throw new Error("Text content is required.");
    }

    if (currentAsset.file_path) {
      oldFileToRemove = currentAsset.file_path;
    }

    nextFilePath = null;
    nextFileName = "";
    nextFileSize = 0;
    nextMimeType = "";
  }

  const updatePayload: Record<string, string | number | null> = {
    content_page_id: input.contentPageId,
    title: input.title.trim(),
    category: input.type,
    type: input.type,
    content: input.type === "text" ? input.content.trim() : "",
    description: input.description.trim(),
    file_path: nextFilePath,
  };

  if (typeof nextFileName === "string") {
    updatePayload.file_name = nextFileName;
  }

  if (typeof nextFileSize === "number") {
    updatePayload.file_size = nextFileSize;
  }

  if (typeof nextMimeType === "string") {
    updatePayload.mime_type = nextMimeType;
  }

  if (input.type === "text") {
    updatePayload.file_name = "";
    updatePayload.file_size = 0;
    updatePayload.mime_type = "";
  }

  const { data, error } = await supabase
    .from("asset_library")
    .update(updatePayload)
    .eq("id", input.id)
    .select("id")
    .single();

  if (error) {
    if (uploadedReplacementPath) {
      await supabase.storage.from(ASSET_BUCKET).remove([uploadedReplacementPath]);
    }

    throw new Error(error.message);
  }

  if (oldFileToRemove && oldFileToRemove !== uploadedReplacementPath) {
    await supabase.storage.from(ASSET_BUCKET).remove([oldFileToRemove]);
  }

  return data;
}

export async function deleteAsset(id: string) {
  const currentAsset = await getAssetStorageReference(id);

  if (currentAsset.file_path) {
    const { error: storageError } = await supabase.storage
      .from(ASSET_BUCKET)
      .remove([currentAsset.file_path]);

    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  const { error } = await supabase.from("asset_library").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return id;
}

async function getAssetStorageReference(id: string) {
  const { data, error } = await supabase
    .from("asset_library")
    .select("id, type, file_path")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AssetStorageReference;
}

async function createSignedAssetUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from(ASSET_BUCKET)
    .createSignedUrl(filePath, 60 * 60);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

function validateAssetFile(type: AssetType, file: File) {
  if (type === "pdf") {
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      throw new Error("Only PDF files are allowed.");
    }

    if (file.size > 50 * 1024 * 1024) {
      throw new Error("PDF must be 50MB or smaller.");
    }

    return;
  }

  if (type === "image") {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

    const lowerName = file.name.toLowerCase();
    const validExtension = allowedExtensions.some((extension) =>
      lowerName.endsWith(extension),
    );

    if (!allowedTypes.includes(file.type) && !validExtension) {
      throw new Error("Only JPG, PNG, WEBP, or GIF images are allowed.");
    }

    if (file.size > 20 * 1024 * 1024) {
      throw new Error("Image must be 20MB or smaller.");
    }
  }
}

function buildAssetFilePath(
  contentPageId: string,
  type: AssetType,
  fileName: string,
) {
  const safeName = sanitizeFileName(fileName);
  const uniqueId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${contentPageId}/${type}/${Date.now()}-${uniqueId}-${safeName}`;
}

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function fallbackMimeType(type: AssetType) {
  if (type === "pdf") {
    return "application/pdf";
  }

  if (type === "image") {
    return "image/png";
  }

  return "";
}

function assetTypeLabel(type: AssetType) {
  switch (type) {
    case "image":
      return "Image";
    case "text":
      return "Text";
    case "pdf":
      return "PDF";
    default:
      return "Asset";
  }
}