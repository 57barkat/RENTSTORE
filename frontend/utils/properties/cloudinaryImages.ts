const CLOUDINARY_IMAGE_UPLOAD_MARKER = "/image/upload/";
const PROPERTY_DISPLAY_WATERMARK_TRANSFORMATION =
  "l_logo_z9nkpk/c_thumb,h_400,w_400/fl_layer_apply,x_20,y_20";

export const buildWatermarkedPropertyImageUrl = (
  cleanUrl?: string | null
): string => {
  const trimmedUrl = typeof cleanUrl === "string" ? cleanUrl.trim() : "";

  if (!trimmedUrl) {
    return "";
  }

  const [urlWithoutQuery, queryString] = trimmedUrl.split("?");
  const markerIndex = urlWithoutQuery.indexOf(CLOUDINARY_IMAGE_UPLOAD_MARKER);

  if (
    markerIndex === -1 ||
    urlWithoutQuery.includes(PROPERTY_DISPLAY_WATERMARK_TRANSFORMATION)
  ) {
    return trimmedUrl;
  }

  const uploadStart = markerIndex + CLOUDINARY_IMAGE_UPLOAD_MARKER.length;
  const displayUrl = `${urlWithoutQuery.slice(
    0,
    uploadStart
  )}${PROPERTY_DISPLAY_WATERMARK_TRANSFORMATION}/${urlWithoutQuery.slice(
    uploadStart
  )}`;

  return queryString ? `${displayUrl}?${queryString}` : displayUrl;
};

export const buildWatermarkedPropertyImageUrls = (
  cleanUrls?: Array<string | null | undefined> | null
): string[] => {
  if (!Array.isArray(cleanUrls)) {
    return [];
  }

  // Mobile display should receive watermarked delivery URLs, while uploads and
  // owner edit flows continue storing and using clean Cloudinary secure_url values.
  return cleanUrls.map(buildWatermarkedPropertyImageUrl).filter(Boolean);
};
