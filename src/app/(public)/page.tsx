import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

export default function PublicHomePage() {
  return (
    <section className="space-y-8">
      <SectionHeader
        eyebrow="Ruang Keluarga"
        title="Selamat Datang di Kisah Keluarga"
        description="Tempat hangat untuk melihat anggota keluarga, memahami relasi, dan menyimpan cerita penting. Mulai dari direktori, lalu buka profil yang Anda butuhkan."
      />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/keluarga"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-amber-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-800"
        >
          Buka Direktori Keluarga
        </Link>
        <Link
          href="/timeline"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-stone-200 bg-white px-5 py-3 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          Buka Timeline Cerita
        </Link>
        <Link
          href="/anggota-baru"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-stone-200 px-5 py-3 text-base font-semibold text-stone-800 transition-colors hover:bg-stone-300"
        >
          Tambah Anggota (Editor/Admin)
        </Link>
      </div>

      <Card className="space-y-3 p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-stone-900">Mulai dengan alur yang paling sederhana</h3>
        <p className="text-base leading-relaxed text-stone-600">
          Jika ingin melihat data saja, gunakan menu <strong>Keluarga</strong>, <strong>Timeline</strong>, atau{" "}
          <strong>Pohon</strong>. Untuk mengubah data, silakan login dengan akun yang memiliki izin editor/admin.
        </p>
      </Card>
    </section>
  );
}
