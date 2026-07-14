const PLACEHOLDER_URL = "https://placehold.co/150x150.png?text=No+Image";
const BACKEND_IMAGE_BASE_URL = "http://localhost:5000/images";

function getFileName(foto = "") {
  const value = String(foto).trim();
  if (!value) return "";
  const withoutQuery = value.split("?")[0];
  const parts = withoutQuery.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}

export function buildImageCandidates(foto) {
  const fileName = getFileName(foto);
  const candidates = [];

  if (fileName) {
    candidates.push(`/images/${fileName}`);
    candidates.push(`${BACKEND_IMAGE_BASE_URL}/${fileName}`);
  } else if (typeof foto === "string" && foto.trim()) {
    candidates.push(foto.trim());
  }

  candidates.push(PLACEHOLDER_URL);

  return [...new Set(candidates)];
}

export function createImageFallbackProps(foto) {
  const [first, ...rest] = buildImageCandidates(foto);

  return {
    src: first,
    "data-fallback-candidates": JSON.stringify(rest),
    "data-fallback-index": "0",
  };
}

export function handleImageError(event) {
  const el = event.currentTarget;
  const candidates = JSON.parse(el.dataset.fallbackCandidates || "[]");
  const currentIndex = Number(el.dataset.fallbackIndex || "0");
  const nextSrc = candidates[currentIndex];

  if (!nextSrc) {
    el.onerror = null;
    return;
  }

  el.dataset.fallbackIndex = String(currentIndex + 1);
  el.src = nextSrc;
}
