import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="min-h-screen p-4 pt-16 lg:ml-64 lg:p-6 lg:pt-6">{children}</main>
    </>
  );
}
