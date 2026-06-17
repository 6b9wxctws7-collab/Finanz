import type { Metadata } from "next";
import "./globals.css";
import { PlanProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "MoneyTimeline Studio",
  description:
    "Interaktiver Finanz-Zukunftsplaner für Deutschland und die Schweiz. Simulation, keine Anlageberatung.",
  icons: { icon: "/logo-mark.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen font-sans antialiased">
        <PlanProvider>{children}</PlanProvider>
      </body>
    </html>
  );
}
