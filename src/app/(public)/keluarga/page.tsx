import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
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
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Direktori Keluarga"
        title="Daftar Anggota"
        description="Temukan anggota keluarga dengan cepat berdasarkan nama atau panggilan. Anggota yang diarsipkan tidak ditampilkan di daftar utama."
      />

      <MemberSearchForm value={searchQuery} />

      {searchQuery ? (
        <Card className="rounded-2xl border-stone-200 p-4">
          <p className="text-sm leading-relaxed text-stone-700">
            Menampilkan <span className="font-semibold">{members.length}</span> hasil untuk{" "}
            <span className="font-semibold">&quot;{searchQuery}&quot;</span>.
          </p>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/pohon"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-stone-200 bg-white px-5 py-3 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          Lihat Mode Pohon
        </Link>
        <Link
          href="/timeline"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-stone-200 bg-white px-5 py-3 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          Lihat Timeline Cerita
        </Link>
        <Link
          href="/anggota-baru"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-amber-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-800"
        >
          Tambah Anggota (Editor/Admin)
        </Link>
      </div>

      {members.length === 0 ? (
        searchQuery ? (
          <EmptyState
            title="Anggota belum ditemukan"
            description="Belum ada anggota yang cocok dengan pencarian Anda. Coba nama atau panggilan lain."
          />
        ) : (
          <EmptyState
            title="Belum ada anggota aktif"
            description="Editor atau admin bisa menambahkan anggota pertama dari tombol di atas."
          />
        )
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
