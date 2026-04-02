import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/permissions/guards";

type EditMemberPageProps = {
  params: Promise<{ personId: string }>;
};

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { personId } = await params;
  await requireEditor(`/anggota/${personId}/edit`);

  const query = new URLSearchParams();
  query.set("memberId", personId);
  query.set("edit", "true");
  redirect(`/?${query.toString()}`);
}
