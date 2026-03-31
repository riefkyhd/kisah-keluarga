import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/permissions/guards";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireAdmin("/admin");
  return <>{children}</>;
}
