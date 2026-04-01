import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { requireAdmin } from "@/lib/permissions/guards";

export default async function AdminPage() {
  await requireAdmin("/admin");

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Area Terlindungi"
        title="Admin"
        description="Ruang ini khusus admin untuk menjalankan pengelolaan data keluarga secara aman."
      />

      <Card className="space-y-4 rounded-[1.75rem] border-stone-100 p-5 sm:p-6">
        <p className="text-base leading-relaxed text-stone-700">
          Halaman ini hanya dapat diakses oleh pengguna dengan role admin, dan seluruh pengecekan akses tetap
          dilakukan di sisi server.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/keluarga"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-stone-200 bg-white px-5 py-3 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50"
          >
            Buka Direktori
          </Link>
          <Link
            href="/anggota-baru"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-amber-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-800"
          >
            Tambah Anggota
          </Link>
          <Link
            href="/cerita-baru"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-stone-200 bg-white px-5 py-3 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50"
          >
            Tambah Cerita
          </Link>
        </div>
      </Card>
    </section>
  );
}
