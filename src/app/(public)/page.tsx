import Link from "next/link";

export default function PublicHomePage() {
  return (
    <section className="space-y-4">
      <p className="text-sm font-medium uppercase tracking-wide text-amber-700">
        Phase 0 Foundation
      </p>
      <h2 className="text-2xl font-semibold leading-tight text-slate-900">
        Selamat datang di Kisah Keluarga
      </h2>
      <p className="max-w-xl text-base leading-relaxed text-slate-700">
        Fondasi aplikasi sudah aktif. Halaman ini sengaja minimal untuk tahap
        awal sebelum fitur auth, CRUD anggota, relasi, dan media dibangun.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-white"
        >
          Halaman Login Placeholder
        </Link>
        <Link
          href="/admin"
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
        >
          Halaman Admin Placeholder
        </Link>
      </div>
    </section>
  );
}
