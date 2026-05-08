"use client";

import { useState } from "react";

interface DynamicFaviconProps {
  faviconUrl?: string;
}

export function DynamicFavicon({ faviconUrl }: DynamicFaviconProps) {
  const [faviconPath] = useState<string>(faviconUrl || "/favicon.ico");

  return (
    <>
      <link rel="icon" href={faviconPath} type="image/png" />
      <link rel="apple-touch-icon" href={faviconPath} />
    </>
  );
}
