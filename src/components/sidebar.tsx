import Image from "next/image";
import Link from "next/link";

import { Projects } from "./projects";
import { Navigation } from "./navigation";
import { DottedSeparator } from "./dotted-separator";
import { WorkspaceSwitcher } from "./workspace-switcher";

export const Sidebar = () => {
  return (
    <aside className="h-full w-full bg-card p-4">
      <Link href="/" className="inline-block transition-opacity hover:opacity-90">
        <Image src="/logo.png" alt="logo" width={164} height={48} />
      </Link>
      <DottedSeparator className="my-5" />
      <WorkspaceSwitcher />
      <DottedSeparator className="my-5" />
      <Navigation />
      <DottedSeparator className="my-5" />
      <Projects />
    </aside>
  );
};
