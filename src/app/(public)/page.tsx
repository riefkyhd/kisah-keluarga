import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, TreeDeciduous, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { InstallAppPrompt } from "@/components/pwa/install-app-prompt";
import { Button } from "@/components/ui/button";
import { hasMinimumRole, normalizeRole } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";
import { isAuthBypassEnabled } from "@/lib/auth/bypass";
import { createClient } from "@/lib/supabase/server";

const stats = [
  {
    label: "Anggota",
    value: "Profil keluarga tersusun rapi"
  },
  {
    label: "Generasi",
    value: "Relasi lintas orang tua dan anak"
  },
  {
    label: "Cerita",
    value: "Momen tersimpan per waktu"
  }
];

const quickNavItems = [
  {
    href: "/keluarga",
    title: "Anggota",
    description: "Temukan profil anggota dengan cepat.",
    icon: Users
  },
  {
    href: "/pohon",
    title: "Pohon",
    description: "Lihat relasi antar generasi secara visual.",
    icon: TreeDeciduous
  },
  {
    href: "/timeline",
    title: "Cerita",
    description: "Baca kenangan keluarga dalam urutan waktu.",
    icon: BookOpen
  }
];

async function canManageMembersFromHome() {
  if (isAuthBypassEnabled()) {
    return true;
  }

  const user = await getCurrentUser();
  if (!user) {
    return false;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return false;
  }

  return hasMinimumRole(normalizeRole((data as { role?: unknown } | null)?.role), "editor");
}

export default async function PublicHomePage() {
  const canManageMembers = await canManageMembersFromHome();

  return (
    <section className="space-y-8 md:space-y-10">
      <div className="grid items-center gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-6 border-[color:var(--color-sand)] bg-gradient-to-br from-white via-[color:var(--color-cream)] to-[color:var(--color-warm)] px-6 py-7 shadow-[0_12px_34px_rgba(74,55,40,0.09)] sm:px-8 sm:py-9">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--color-sand)] bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--color-clay)]">
            <Sparkles className="h-3.5 w-3.5" />
            Arsip Keluarga
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl leading-tight text-[color:var(--color-bark)] sm:text-5xl">
              Simpan kisah keluarga dalam ruang yang hangat dan mudah dipahami.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[color:var(--color-clay)] sm:text-lg">
              Kelola profil anggota, relasi keluarga, foto, dan cerita berharga dalam satu aplikasi yang tenang
              untuk semua generasi.
            </p>
          </div>
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-[color:var(--color-clay)]">
            <ArrowRight className="h-4 w-4" />
            Pilih menu Anggota, Pohon, atau Cerita untuk mulai.
          </p>
        </Card>

        <Card className="relative overflow-hidden border-[color:var(--color-sand)] bg-[linear-gradient(160deg,#fff_10%,#f6efe4_100%)] px-5 py-6 shadow-[0_10px_24px_rgba(74,55,40,0.10)]">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.12em] text-[color:var(--color-clay)]">
            Pratinjau Pohon Mini
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="rounded-2xl border border-[color:var(--color-sand)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--color-bark)]">
                Ali
              </div>
              <div className="text-sm text-[color:var(--color-clay)]">↔</div>
              <div className="rounded-2xl border border-[color:var(--color-sand)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--color-bark)]">
                Wuri
              </div>
            </div>
            <div className="mx-auto h-5 w-px bg-[color:var(--color-sand)]" />
            <div className="mx-auto h-px w-32 bg-[color:var(--color-sand)]" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-[color:var(--color-sand)] bg-white px-2 py-2 text-xs font-medium text-[color:var(--color-bark)]">
                Dina
              </div>
              <div className="rounded-xl border border-[color:var(--color-sand)] bg-white px-2 py-2 text-xs font-medium text-[color:var(--color-bark)]">
                Raka
              </div>
              <div className="rounded-xl border border-[color:var(--color-sand)] bg-white px-2 py-2 text-xs font-medium text-[color:var(--color-bark)]">
                Nala
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-[color:var(--color-sand)] bg-white/90 px-4 py-4 shadow-[0_4px_12px_rgba(74,55,40,0.05)]"
          >
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--color-clay)]">{stat.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-bark)]">{stat.value}</p>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl text-[color:var(--color-bark)]">Akses Cepat</h2>
          <p className="text-[color:var(--color-clay)]">Tiga jalur utama untuk membaca dan menelusuri kisah keluarga.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="block">
                <Card className="h-full border-[color:var(--color-sand)] bg-white/95 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="mb-4 inline-flex rounded-2xl bg-[color:var(--color-warm)] p-3 text-[color:var(--color-clay)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[color:var(--color-bark)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-clay)]">{item.description}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <Card className="border-[color:var(--color-sand)] bg-white/90 p-5 sm:p-6">
        <h3 className="text-2xl text-[color:var(--color-bark)]">Cerita keluarga, dalam alur paling sederhana</h3>
        <p className="mt-3 text-base leading-relaxed text-[color:var(--color-clay)]">
          Baca profil anggota, jelajahi relasi di mode pohon, lalu lanjutkan ke cerita timeline. Jika Anda membantu
          mengelola data keluarga, gunakan akses editor atau admin untuk menambahkan anggota baru.
        </p>
        {canManageMembers ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/anggota-baru">
              <Button className="bg-[color:var(--color-clay)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-bark)]">
                Tambah Anggota
              </Button>
            </Link>
          </div>
        ) : null}
      </Card>

      <InstallAppPrompt />
    </section>
  );
}
