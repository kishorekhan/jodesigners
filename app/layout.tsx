import type { Metadata } from "next";
import "./globals.css";
import "./app.css";

export const metadata: Metadata = {
  title: "JO Designers | Bespoke Tailoring & Custom Costumes",
  description: "Exclusive customized designer wear, couture tailoring & outfits for women & kids",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
