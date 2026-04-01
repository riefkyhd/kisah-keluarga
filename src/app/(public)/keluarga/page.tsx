import Link from "next/link";
import { GenerationFilter } from "@/components/GenerationFilter";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { MemberCard } from "@/components/members/member-card";
import { MemberSearchForm } from "@/components/members/member-search-form";
import { hasMinimumRole } from "@/lib/auth/roles";
import { requireViewer } from "@/lib/permissions/guards";
import { listDirectoryMembers } from "@/server/queries/members";
import { Plus } from "lucide-react";

type FamilyDirectoryPageProps = {
  searchParams: Promise<{ q?: string; gen?: string; page?: string }>;
};

function normalizeSearchQuery(rawQuery?: string) {
  if (!rawQuery) {
    return "";
  }

  return rawQuery.trim().replace(/\s+/g, " ").slice(0, 80);
}

export default async function FamilyDirectoryPage({ searchParams }: FamilyDirectoryPageProps) {
  const { role } = await requireViewer("/keluarga");
  const query = await searchParams;
  const searchQuery = normalizeSearchQuery(query.q);
  const page = Number.parseInt(query.page ?? "1", 10);
  const directoryData = await listDirectoryMembers({
    searchQuery,
    generation: query.gen,
    page: Number.isNaN(page) ? 1 : page
  });
  const canManageMembers = hasMinimumRole(role, "editor");

  const buildDirectoryHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("q", searchQuery);
    }

    if (directoryData.generationFilter) {
      params.set("gen", String(directoryData.generationFilter));
    }

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    const queryString = params.toString();
    return queryString ? `/keluarga?${queryString}` : "/keluarga";
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Direktori Keluarga"
        title="Daftar Anggota"
        description="Cari dan jelajahi profil anggota keluarga dengan nyaman. Anggota yang diarsipkan tidak ditampilkan di daftar utama."
      />

      <MemberSearchForm value={searchQuery} />
      <GenerationFilter selectedGeneration={directoryData.generationFilter} />

      {searchQuery ? (
        <Card className="rounded-2xl border-stone-200 p-4">
          <p className="text-sm leading-relaxed text-stone-700">
            Menampilkan <span className="font-semibold">{directoryData.totalCount}</span> hasil untuk{" "}
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
        {canManageMembers ? (
          <Link
            href="/anggota-baru"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-amber-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-800"
          >
            Tambah Anggota (Editor/Admin)
          </Link>
        ) : null}
      </div>

      {directoryData.members.length === 0 ? (
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
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {directoryData.members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
          {canManageMembers ? (
            <li data-testid="add-member-card">
              <Link href="/anggota-baru" className="group block h-full">
                <Card className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed border-stone-300 bg-stone-50/60 p-6 text-center transition-colors hover:border-amber-300 hover:bg-amber-50/40">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-amber-700 shadow-sm">
                    <Plus className="h-6 w-6" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-stone-900 group-hover:text-amber-700">
                      Tambah Anggota
                    </p>
                    <p className="text-sm text-stone-600">Buat profil anggota keluarga baru</p>
                  </div>
                </Card>
              </Link>
            </li>
          ) : null}
        </ul>
      )}

      {directoryData.totalPages > 1 ? (
        <Card className="rounded-2xl border-stone-200 p-4">
          <div className="flex items-center justify-between gap-3">
            {directoryData.page > 1 ? (
              <Link
                href={buildDirectoryHref(directoryData.page - 1)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
              >
                ← Prev
              </Link>
            ) : (
              <span className="inline-flex min-h-11 items-center rounded-xl border border-stone-100 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-400">
                ← Prev
              </span>
            )}

            <p className="text-sm font-medium text-stone-700">
              Page {directoryData.page} of {directoryData.totalPages}
            </p>

            {directoryData.page < directoryData.totalPages ? (
              <Link
                href={buildDirectoryHref(directoryData.page + 1)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
              >
                Next →
              </Link>
            ) : (
              <span className="inline-flex min-h-11 items-center rounded-xl border border-stone-100 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-400">
                Next →
              </span>
            )}
          </div>
        </Card>
      ) : null}
    </section>
  );
}
