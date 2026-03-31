import { requireAdmin } from "@/lib/permissions/guards";

export default async function AdminPage() {
  await requireAdmin("/admin");

  return (
    <section className="space-y-4">
      <p className="text-sm font-medium uppercase tracking-wide text-amber-700">
        Area Terlindungi
      </p>
      <h2 className="text-xl font-semibold text-slate-900">Admin</h2>
      <p className="text-slate-700">
        Halaman ini hanya bisa diakses oleh pengguna dengan role admin, dan
        pengecekan akses dilakukan di sisi server.
      </p>
    </section>
  );
}
