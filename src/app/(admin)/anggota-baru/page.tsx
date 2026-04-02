import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/permissions/guards";

export default async function NewMemberPage() {
  await requireEditor("/anggota-baru");
  redirect("/?action=add");
}
