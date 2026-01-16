import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio | Vanguard",
  description: "Create amazing visuals with AI-powered coding",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      {children}
    </div>
  );
}
