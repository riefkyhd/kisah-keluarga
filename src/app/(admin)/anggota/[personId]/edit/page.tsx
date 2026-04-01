import Link from "next/link";
import { notFound } from "next/navigation";
import { MemberForm } from "@/components/members/member-form";
import { requireEditor } from "@/lib/permissions/guards";
import { archiveMemberAction, restoreMemberAction, updateMemberAction } from "@/server/actions/members";
import { getMemberById } from "@/server/queries/members";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBanner } from "@/components/ui/status-banner";

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
    <section className="space-y-6">
      <Link
        href={`/keluarga/${personId}`}
        className="inline-flex min-h-10 items-center rounded-xl px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
      >
        ← Kembali ke profil anggota
      </Link>

      <SectionHeader
        title="Edit Anggota"
        description="Perbarui data anggota dengan tenang. Gunakan arsip/pulihkan untuk menjaga keamanan data keluarga."
        eyebrow="Form Anggota"
      />

      {errorMessage ? (
        <StatusBanner variant="error" message={errorMessage} />
      ) : null}

      {statusMessage ? (
        <StatusBanner variant="success" message={statusMessage} />
      ) : null}

      <MemberForm
        action={updateMemberAction}
        submitLabel="Simpan Perubahan"
        personId={personId}
        initialValues={member}
      />

      <Card className="space-y-4 rounded-[2rem] border-stone-100 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-stone-900">Arsip / Pulihkan</h3>
        <p className="text-sm leading-relaxed text-stone-600">
          Penghapusan permanen tidak disediakan di fase ini. Gunakan arsip untuk menjaga keamanan data keluarga.
        </p>
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          {member.is_archived ? (
            <form action={restoreMemberAction} className="space-y-3">
              <input type="hidden" name="person_id" value={personId} />
              <p className="text-sm leading-relaxed text-stone-700">
                Anggota ini sedang diarsipkan. Pulihkan jika ingin menampilkannya kembali di direktori aktif.
              </p>
              <Button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                Pulihkan Anggota
              </Button>
            </form>
          ) : (
            <form action={archiveMemberAction} className="space-y-3">
              <input type="hidden" name="person_id" value={personId} />
              <p className="text-sm leading-relaxed text-stone-700">
                Arsipkan anggota jika datanya tetap ingin disimpan tetapi tidak ditampilkan di daftar utama.
              </p>
              <Button type="submit" className="w-full bg-amber-700 text-white hover:bg-amber-800">
                Arsipkan Anggota
              </Button>
            </form>
          )}
        </div>
      </Card>
    </section>
  );
}
