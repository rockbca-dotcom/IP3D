"use client";

import { useEffect, useState } from "react";

interface DynamicFaviconProps {
  faviconUrl?: string;
}

export function DynamicFavicon({ faviconUrl }: DynamicFaviconProps) {
  const [faviconPath, setFaviconPath] = useState<string>(faviconUrl || "/favicon.ico");

  useEffect(() => {
    if (faviconUrl) {
      setFaviconPath(faviconUrl);
    }
  }, [faviconUrl]);

  return (
    <>
      <link rel="icon" href={faviconPath} type="image/png" />
      <link rel="apple-touch-icon" href={faviconPath} />
    </>
  );
}
