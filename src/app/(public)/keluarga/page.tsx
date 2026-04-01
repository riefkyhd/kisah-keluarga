import Link from "next/link";
import { MemberCard } from "@/components/members/member-card";
import { MemberSearchForm } from "@/components/members/member-search-form";
import { requireViewer } from "@/lib/permissions/guards";
import { listActiveMembers } from "@/server/queries/members";

type FamilyDirectoryPageProps = {
  searchParams: Promise<{ q?: string }>;
};

function normalizeSearchQuery(rawQuery?: string) {
  if (!rawQuery) {
    return "";
  }

  return rawQuery.trim().replace(/\s+/g, " ").slice(0, 80);
}

export default async function FamilyDirectoryPage({ searchParams }: FamilyDirectoryPageProps) {
  await requireViewer("/keluarga");
  const query = await searchParams;
  const searchQuery = normalizeSearchQuery(query.q);
  const members = await listActiveMembers(searchQuery);

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
      <MemberSearchForm value={searchQuery} />

      {searchQuery ? (
        <p className="text-sm text-slate-700">
          Menampilkan {members.length} hasil untuk: <span className="font-semibold">&quot;{searchQuery}&quot;</span>
        </p>
      ) : null}

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
          {searchQuery
            ? "Belum ada anggota yang cocok dengan pencarian Anda. Coba nama atau panggilan lain."
            : "Belum ada anggota aktif. Editor atau admin bisa menambahkan anggota pertama dari tombol di atas."}
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
