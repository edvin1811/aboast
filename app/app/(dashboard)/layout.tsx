import { WorkspaceProvider } from "./components/WorkspaceProvider";
import { Sidebar } from "./components/Sidebar";
import { UserPlanProvider } from "@/lib/use-user-plan";
import { UpgradeDialogProvider } from "@/lib/use-upgrade-dialog";
import { UpgradeDialog } from "@/components/UpgradeDialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <UserPlanProvider>
        <UpgradeDialogProvider>
          <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="ml-64">
              <main className="mx-auto max-w-[1152px] px-10 py-12">{children}</main>
            </div>
            <UpgradeDialog />
          </div>
        </UpgradeDialogProvider>
      </UserPlanProvider>
    </WorkspaceProvider>
  );
}
