import type { ReactNode } from "react";
import { requireEditor } from "@/lib/permissions/guards";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireEditor("/admin");
  return <>{children}</>;
}
