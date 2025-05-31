
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Layout() {
  const { currentOrganization, isLoadingOrganizations } = useOrganizations();

  if (isLoadingOrganizations) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner message="Loading workspace..." />
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">No Organization Selected</h2>
          <p className="text-muted-foreground">Please select an organization to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
