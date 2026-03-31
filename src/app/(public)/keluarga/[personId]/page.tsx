import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUserRole, requireViewer } from "@/lib/permissions/guards";
import { hasMinimumRole } from "@/lib/auth/roles";
import { getMemberById } from "@/server/queries/members";

type MemberProfilePageProps = {
  params: Promise<{ personId: string }>;
};

export default async function MemberProfilePage({ params }: MemberProfilePageProps) {
  const { personId } = await params;

  await requireViewer(`/keluarga/${personId}`);
  const role = await getCurrentUserRole();
  const canManageMember = hasMinimumRole(role, "editor");

  const member = await getMemberById(personId, canManageMember);
  if (!member) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <Link href="/keluarga" className="inline-block text-sm font-medium text-amber-700">
        ← Kembali ke direktori
      </Link>

      <header className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-2xl font-semibold text-slate-900">{member.full_name}</h2>
        {member.nickname ? <p className="text-slate-700">Panggilan: {member.nickname}</p> : null}
        {member.is_archived ? (
          <p className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-900">
            Anggota ini sedang diarsipkan.
          </p>
        ) : null}
      </header>

      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
        <p>Status: {member.is_living ? "Masih hidup" : "Sudah wafat"}</p>
        {member.birth_date ? <p>Tanggal lahir: {member.birth_date}</p> : null}
        {member.death_date ? <p>Tanggal wafat: {member.death_date}</p> : null}
        {member.gender ? (
          <p>
            Jenis kelamin:{" "}
            {member.gender === "male"
              ? "Laki-laki"
              : member.gender === "female"
                ? "Perempuan"
                : "Lainnya"}
          </p>
        ) : null}
        {member.bio ? <p>Catatan: {member.bio}</p> : null}
      </div>

      {canManageMember ? (
        <div>
          <Link
            href={`/anggota/${member.id}/edit`}
            className="inline-block rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
          >
            Edit / Arsipkan Anggota
          </Link>
        </div>
      ) : null}
    </section>
  );
}
