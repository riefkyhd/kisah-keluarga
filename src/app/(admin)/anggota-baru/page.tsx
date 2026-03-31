import Link from "next/link";
import { MemberForm } from "@/components/members/member-form";
import { requireEditor } from "@/lib/permissions/guards";
import { createMemberAction } from "@/server/actions/members";

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
    <section className="space-y-4">
      <Link href="/keluarga" className="inline-block text-sm font-medium text-amber-700">
        ← Kembali ke direktori
      </Link>
      <h2 className="text-2xl font-semibold text-slate-900">Tambah Anggota Baru</h2>
      <p className="text-slate-700">
        Isi data dasar dulu agar cepat. Detail lain bisa ditambahkan nanti.
      </p>

      {errorMessage ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      <MemberForm action={createMemberAction} submitLabel="Simpan Anggota" />
    </section>
  );
}
