const svgToDataUrl = (svg: string): string => {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getInitials = (name: string): string => {
  const trimmed = name.trim();

  if (!trimmed) {
    return "A";
  }

  const parts = trimmed.split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "A";
};

export const getAvatarPlaceholder = (name: string): string => {
  const initials = getInitials(name);

  return svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="${initials}">
      <rect width="128" height="128" rx="64" fill="#0f172a" />
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="44" font-weight="700">
        ${initials}
      </text>
    </svg>
  `);
};
