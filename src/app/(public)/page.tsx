import Link from "next/link";

export default function PublicHomePage() {
  return (
    <section className="space-y-4">
      <p className="text-sm font-medium uppercase tracking-wide text-amber-700">
        Phase 7 Stories & Timeline
      </p>
      <h2 className="text-2xl font-semibold leading-tight text-slate-900">
        Selamat datang di Kisah Keluarga
      </h2>
      <p className="max-w-xl text-base leading-relaxed text-slate-700">
        Profil keluarga kini dilengkapi timeline cerita agar momen penting keluarga
        tetap hangat, mudah dicari, dan aman dikelola sesuai peran.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/keluarga"
          className="rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-white"
        >
          Buka Direktori Keluarga
        </Link>
        <Link
          href="/timeline"
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
        >
          Buka Timeline Cerita
        </Link>
        <Link
          href="/anggota-baru"
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
        >
          Tambah Anggota (Editor/Admin)
        </Link>
      </div>
    </section>
  );
}
