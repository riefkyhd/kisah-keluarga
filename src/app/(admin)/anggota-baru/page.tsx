import Link from "next/link";
import { MemberForm } from "@/components/members/member-form";
import { requireEditor } from "@/lib/permissions/guards";
import { createMemberAction } from "@/server/actions/members";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBanner } from "@/components/ui/status-banner";

type NewMemberPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  invalid_form: "Data belum lengkap atau belum valid. Mohon periksa kembali.",
  save_failed: "Data belum tersimpan. Coba lagi sebentar."
};

export default async function NewMemberPage({ searchParams }: NewMemberPageProps) {
  await requireEditor("/anggota-baru");
  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] : "";

  return (
    <section className="space-y-6">
      <Link href="/keluarga" className="inline-flex rounded-xl px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50">
        ← Kembali ke direktori
      </Link>

      <SectionHeader
        title="Tambah Anggota Baru"
        description="Isi data dasar dulu agar proses cepat dan mudah dipahami. Detail lain dapat ditambahkan nanti."
        eyebrow="Form Anggota"
      />

      {errorMessage ? (
        <StatusBanner variant="error" message={errorMessage} />
      ) : null}

      <MemberForm action={createMemberAction} submitLabel="Simpan Anggota" />
    </section>
  );
}
