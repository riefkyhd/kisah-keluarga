import Link from "next/link";
import { notFound } from "next/navigation";
import { MemberForm } from "@/components/members/member-form";
import { requireEditor } from "@/lib/permissions/guards";
import { archiveMemberAction, restoreMemberAction, updateMemberAction } from "@/server/actions/members";
import { getMemberById } from "@/server/queries/members";

type EditMemberPageProps = {
  params: Promise<{ personId: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
};

const errorMessages: Record<string, string> = {
  invalid_form: "Data belum valid. Mohon periksa kembali.",
  save_failed: "Perubahan belum tersimpan. Coba lagi.",
  archive_failed: "Gagal mengarsipkan anggota. Coba lagi.",
  restore_failed: "Gagal memulihkan anggota. Coba lagi."
};

const statusMessages: Record<string, string> = {
  archived: "Anggota berhasil diarsipkan.",
  restored: "Anggota berhasil dipulihkan."
};

export default async function EditMemberPage({ params, searchParams }: EditMemberPageProps) {
  const { personId } = await params;
  await requireEditor(`/anggota/${personId}/edit`);

  const member = await getMemberById(personId, true);
  if (!member) {
    notFound();
  }

  const query = await searchParams;
  const errorMessage = query.error ? errorMessages[query.error] : "";
  const statusMessage = query.status ? statusMessages[query.status] : "";

  return (
    <section className="space-y-4">
      <Link href={`/keluarga/${personId}`} className="inline-block text-sm font-medium text-amber-700">
        ← Kembali ke profil anggota
      </Link>

      <h2 className="text-2xl font-semibold text-slate-900">Edit Anggota</h2>
      <p className="text-slate-700">Perbarui data anggota atau lakukan arsip/pemulihan dengan aman.</p>

      {errorMessage ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      {statusMessage ? (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          {statusMessage}
        </div>
      ) : null}

      <MemberForm
        action={updateMemberAction}
        submitLabel="Simpan Perubahan"
        personId={personId}
        initialValues={member}
      />

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-900">Arsip / Pulihkan</h3>
        <p className="text-sm text-slate-700">
          Penghapusan permanen tidak disediakan di fase ini. Gunakan arsip untuk menjaga keamanan data keluarga.
        </p>

        {member.is_archived ? (
          <form action={restoreMemberAction}>
            <input type="hidden" name="person_id" value={personId} />
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
            >
              Pulihkan Anggota
            </button>
          </form>
        ) : (
          <form action={archiveMemberAction}>
            <input type="hidden" name="person_id" value={personId} />
            <button
              type="submit"
              className="w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white"
            >
              Arsipkan Anggota
            </button>
          </form>
        )}
      </section>
    </section>
  );
}
