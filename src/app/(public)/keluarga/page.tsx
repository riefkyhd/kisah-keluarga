import Link from "next/link";
import { MemberCard } from "@/components/members/member-card";
import { requireViewer } from "@/lib/permissions/guards";
import { listActiveMembers } from "@/server/queries/members";

export default async function FamilyDirectoryPage() {
  await requireViewer("/keluarga");
  const members = await listActiveMembers();

  return (
    <section className="space-y-4">
      <p className="text-sm font-medium uppercase tracking-wide text-amber-700">
        Direktori Keluarga
      </p>
      <h2 className="text-2xl font-semibold text-slate-900">Daftar Anggota</h2>
      <p className="text-slate-700">
        Lihat anggota keluarga yang aktif. Anggota yang diarsipkan tidak
        ditampilkan di daftar utama.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/anggota-baru"
          className="rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-white"
        >
          Tambah Anggota (Editor/Admin)
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-slate-700">
          Belum ada anggota aktif. Editor atau admin bisa menambahkan anggota
          pertama dari tombol di atas.
        </div>
      ) : (
        <ul className="space-y-3">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </ul>
      )}
    </section>
  );
}
