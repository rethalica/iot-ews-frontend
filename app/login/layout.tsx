import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - RSSI Logging Dashboard",
  description: "Login to access the RSSI monitoring system",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
