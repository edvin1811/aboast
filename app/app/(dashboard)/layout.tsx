import { WorkspaceProvider } from "./components/WorkspaceProvider";
import { Sidebar } from "./components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="ml-64">
          <main className="mx-auto max-w-[1152px] px-10 py-12">{children}</main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
