import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import AppShell from "@/components/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Meeting Room Booking",
    template: "%s · Meeting Room Booking",
  },
  description: "Internal meeting room booking system",
};

export default function RootLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
          {modal}
        </Providers>
      </body>
    </html>
  );
}
