import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frogface.space — Life OS",
  description: "Персональная операционная система жизни. RPG-движок. Студия агентов. Командный центр.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
