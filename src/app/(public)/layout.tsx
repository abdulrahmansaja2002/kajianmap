import { HomePage } from "@/components/layout/HomePage";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HomePage>
      {children}
    </HomePage>
  );
}