import { EditTaskModal } from "@/features/tasks/components/edit-task-modal";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return ( 
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <CreateWorkspaceModal />
      <CreateProjectModal />
      <CreateTaskModal />
      <EditTaskModal />
      <div className="flex w-full h-full">
        <div className="fixed left-0 top-0 hidden lg:block lg:w-[264px] h-full overflow-y-auto border-r border-neutral-200 dark:border-slate-700 bg-neutral-50 dark:bg-slate-900">
          <Sidebar />
        </div>
        <div className="lg:pl-[264px] w-full">
          <div className="mx-auto max-w-screen-2xl h-full">
            <Navbar />
            <main className="h-full py-8 px-6 flex flex-col">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default DashboardLayout;
