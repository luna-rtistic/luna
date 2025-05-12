"use client";
import GlobalStyle from "./GlobalStyle";

export default function ClientStyleProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlobalStyle />
      {children}
    </>
  );
}
