"use client";

import SidebarLayout from "@/components/SidebarLayout";
import { sidebarMenuItems } from "@/components/sidebarMenuItems";

export default function AdministrationLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout
      sidebarMenuItems={sidebarMenuItems}
      moduleName="Administration"
      moduleDesc="Administration system"
      moduleShort="AD"
    >
      {children}
    </SidebarLayout>
  );
}
