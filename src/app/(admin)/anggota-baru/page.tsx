import Link from "next/link";
import { Camera } from "lucide-react";
import { MemberForm } from "@/components/members/member-form";
import { Card } from "@/components/ui/card";
import { requireEditor } from "@/lib/permissions/guards";
import { createMemberAction } from "@/server/actions/members";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBanner } from "@/components/ui/status-banner";
import { StatusToast } from "@/components/ui/status-toast";

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
      <Link
        href="/keluarga"
        className="inline-flex min-h-10 items-center rounded-xl px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
      >
        ← Kembali ke direktori
      </Link>

      <SectionHeader
        title="Tambah Anggota Baru"
        description="Isi data dasar dulu agar proses cepat dan mudah dipahami. Detail lain dapat ditambahkan nanti."
        eyebrow="Form Anggota"
      />

      {errorMessage ? (
        <>
          <StatusToast variant="error" message={errorMessage} />
          <StatusBanner variant="error" message={errorMessage} />
        </>
      ) : null}

      <Card className="space-y-3 rounded-[2rem] border-stone-100 p-5 sm:p-6">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[1.75rem] border-2 border-dashed border-stone-300 bg-stone-50 text-stone-400">
          <Camera className="h-7 w-7" />
        </div>
        <p className="text-center text-sm leading-relaxed text-stone-600">
          Foto profil dapat diunggah setelah anggota berhasil disimpan.
        </p>
      </Card>

      <MemberForm action={createMemberAction} submitLabel="Simpan Anggota" />
    </section>
  );
}
