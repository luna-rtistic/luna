"use client";

import React, { useRef } from "react";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

export default function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  // Only create stylesheet once with useRef
  const sheet = useRef<ServerStyleSheet | null>(null);
  if (typeof window === "undefined" && !sheet.current) {
    sheet.current = new ServerStyleSheet();
  }

  if (typeof window === "undefined" && sheet.current) {
    return <StyleSheetManager sheet={sheet.current.instance}>{children}</StyleSheetManager>;
  }

  return <>{children}</>;
} 