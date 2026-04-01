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
        className="inline-flex rounded-xl px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
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

      <Card className="space-y-3 rounded-[2rem] border-stone-100 p-5">
        <h3 className="text-base font-semibold text-stone-900">Arsip / Pulihkan</h3>
        <p className="text-sm leading-relaxed text-stone-600">
          Penghapusan permanen tidak disediakan di fase ini. Gunakan arsip untuk menjaga keamanan data keluarga.
        </p>

        {member.is_archived ? (
          <form action={restoreMemberAction}>
            <input type="hidden" name="person_id" value={personId} />
            <Button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
              Pulihkan Anggota
            </Button>
          </form>
        ) : (
          <form action={archiveMemberAction}>
            <input type="hidden" name="person_id" value={personId} />
            <Button type="submit" className="w-full bg-amber-700 text-white hover:bg-amber-800">
              Arsipkan Anggota
            </Button>
          </form>
        )}
      </Card>
    </section>
  );
}
