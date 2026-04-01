import Link from "next/link";
import { StoryForm } from "@/components/stories/story-form";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBanner } from "@/components/ui/status-banner";
import { requireEditor } from "@/lib/permissions/guards";
import { createStoryAction } from "@/server/actions/stories";
import { listStoryMemberCandidates } from "@/server/queries/stories";

type NewStoryPageProps = {
  searchParams: Promise<{ error?: string; personId?: string }>;
};

const errorMessages: Record<string, string> = {
  invalid_form: "Data cerita belum valid. Mohon periksa kembali.",
  invalid_member: "Anggota terkait tidak valid.",
  archived_member: "Anggota yang diarsipkan tidak dapat ditautkan ke cerita baru.",
  save_failed: "Cerita belum tersimpan. Coba lagi sebentar."
};

export default async function NewStoryPage({ searchParams }: NewStoryPageProps) {
  await requireEditor("/cerita-baru");
  const query = await searchParams;
  const candidates = await listStoryMemberCandidates();
  const errorMessage = query.error ? errorMessages[query.error] : "";
  const preselectedPersonId =
    query.personId && candidates.some((member) => member.id === query.personId) ? query.personId : "";

  return (
    <section className="space-y-6">
      <Link
        href="/timeline"
        className="inline-flex rounded-xl px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
      >
        ← Kembali ke timeline
      </Link>

      <SectionHeader
        eyebrow="Cerita Baru"
        title="Tambah Cerita Keluarga"
        description="Tuliskan momen penting keluarga dengan bahasa sederhana agar nyaman dibaca lintas generasi."
      />

      {errorMessage ? (
        <StatusBanner variant="error" message={errorMessage} />
      ) : null}

      {candidates.length === 0 ? (
        <EmptyState
          title="Belum ada anggota aktif"
          description="Tambahkan anggota keluarga aktif terlebih dahulu sebelum membuat cerita."
        />
      ) : (
        <StoryForm
          action={createStoryAction}
          submitLabel="Simpan Cerita"
          members={candidates}
          initialValues={{ person_id: preselectedPersonId }}
        />
      )}
    </section>
  );
}
