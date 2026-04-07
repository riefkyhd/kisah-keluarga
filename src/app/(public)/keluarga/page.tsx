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
        description="Temukan anggota keluarga berdasarkan nama, panggilan, dan generasi. Anggota diarsipkan tidak ditampilkan di daftar utama."
      />

      <MemberSearchForm value={searchQuery} />
      <GenerationFilter selectedGeneration={directoryData.generationFilter} />

      {searchQuery ? (
        <Card className="p-4">
          <p className="text-sm leading-relaxed text-[color:var(--kk-muted)]">
            Menampilkan <span className="font-medium">{directoryData.totalCount}</span> hasil untuk{" "}
            <span className="font-medium">&quot;{searchQuery}&quot;</span>.
          </p>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-4">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-[var(--kk-radius-md)] border border-[color:var(--kk-border)] bg-white px-5 py-3 text-base font-medium text-[color:var(--color-bark)] transition-all hover:bg-[color:var(--color-warm)]"
        >
          Lihat Mode Pohon
        </Link>
        <Link
          href="/timeline"
          className="inline-flex min-h-12 items-center justify-center rounded-[var(--kk-radius-md)] border border-[color:var(--kk-border)] bg-white px-5 py-3 text-base font-medium text-[color:var(--color-bark)] transition-all hover:bg-[color:var(--color-warm)]"
        >
          Lihat Timeline Cerita
        </Link>
        {canManageMembers ? (
          <Link
            href="/anggota-baru"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--kk-radius-md)] border border-transparent bg-[color:var(--color-clay)] px-5 py-3 text-base font-medium text-white shadow-[var(--kk-shadow-soft)] transition-all hover:bg-[color:var(--color-bark)]"
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
                <Card className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 border-2 border-dashed border-[color:var(--kk-border)] bg-[color:rgb(240_234_224_/_0.45)] p-6 text-center transition-colors hover:border-[color:var(--color-clay)] hover:bg-[color:rgb(240_234_224_/_0.7)]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-[999px] bg-white text-[color:var(--color-clay)] shadow-[var(--kk-shadow-soft)]">
                    <Plus className="h-6 w-6" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-base font-medium text-[color:var(--color-bark)] group-hover:text-[color:var(--color-clay)]">
                      Tambah Anggota
                    </p>
                    <p className="text-sm text-[color:var(--kk-muted)]">Buat profil anggota keluarga baru</p>
                  </div>
                </Card>
              </Link>
            </li>
          ) : null}
        </ul>
      )}

      {directoryData.totalPages > 1 ? (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            {directoryData.page > 1 ? (
              <Link
                href={buildDirectoryHref(directoryData.page - 1)}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--kk-radius-md)] border border-[color:var(--kk-border)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-bark)] transition-colors hover:bg-[color:var(--color-warm)]"
              >
                ← Prev
              </Link>
            ) : (
              <span className="inline-flex min-h-11 items-center rounded-[var(--kk-radius-md)] border border-[color:var(--kk-border)] bg-[color:rgb(240_234_224_/_0.5)] px-4 py-2 text-sm font-medium text-[color:var(--kk-muted)]">
                ← Prev
              </span>
            )}

            <p className="text-sm font-medium text-[color:var(--kk-muted)]">
              Page {directoryData.page} of {directoryData.totalPages}
            </p>

            {directoryData.page < directoryData.totalPages ? (
              <Link
                href={buildDirectoryHref(directoryData.page + 1)}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--kk-radius-md)] border border-[color:var(--kk-border)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-bark)] transition-colors hover:bg-[color:var(--color-warm)]"
              >
                Next →
              </Link>
            ) : (
              <span className="inline-flex min-h-11 items-center rounded-[var(--kk-radius-md)] border border-[color:var(--kk-border)] bg-[color:rgb(240_234_224_/_0.5)] px-4 py-2 text-sm font-medium text-[color:var(--kk-muted)]">
                Next →
              </span>
            )}
          </div>
        </Card>
      ) : null}
    </section>
  );
}
