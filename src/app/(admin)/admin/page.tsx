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
        description="Ruang ini khusus admin untuk menjalankan pengelolaan data keluarga secara aman, tenang, dan terarah."
      />

      <Card className="space-y-5 rounded-[2rem] border-stone-100 p-5 sm:p-6">
        <p className="text-base leading-relaxed text-stone-700">
          Halaman ini hanya dapat diakses oleh pengguna dengan role admin. Seluruh validasi izin tetap diproses di
          sisi server untuk menjaga keamanan data keluarga.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/pengguna"
            className="rounded-2xl border border-stone-200 bg-white px-4 py-4 transition-colors hover:bg-stone-50 sm:col-span-2"
          >
            <p className="font-semibold text-stone-900">Kelola Pengguna</p>
            <p className="mt-1 text-sm text-stone-600">Buat akun baru, atur role, dan ubah kata sandi pengguna.</p>
          </Link>
          <Link
            href="/keluarga"
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 transition-colors hover:bg-stone-100"
          >
            <p className="font-semibold text-stone-900">Buka Direktori</p>
            <p className="mt-1 text-sm text-stone-600">Periksa profil dan relasi anggota keluarga.</p>
          </Link>
          <Link
            href="/anggota-baru"
            className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 transition-colors hover:bg-amber-100"
          >
            <p className="font-semibold text-amber-900">Tambah Anggota</p>
            <p className="mt-1 text-sm text-amber-800">Tambahkan anggota baru dengan data dasar.</p>
          </Link>
          <Link
            href="/cerita-baru"
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 transition-colors hover:bg-stone-100 sm:col-span-2"
          >
            <p className="font-semibold text-stone-900">Tambah Cerita</p>
            <p className="mt-1 text-sm text-stone-600">Simpan momen keluarga penting ke dalam timeline.</p>
          </Link>
        </div>
      </Card>
    </section>
  );
}
