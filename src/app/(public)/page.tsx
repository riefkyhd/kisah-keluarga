import Link from "next/link";
import { BookOpen, Heart, LogOut, Settings, TreeDeciduous, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { InstallAppPrompt } from "@/components/pwa/install-app-prompt";
import { Button } from "@/components/ui/button";

export default function PublicHomePage() {
  return (
    <section className="space-y-8">
      <header className="flex items-center justify-between py-1 md:hidden">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-amber-100 p-2">
            <Heart className="h-5 w-5 fill-amber-700 text-amber-700" />
          </div>
          <span className="text-lg font-semibold text-stone-900">Kisah Keluarga</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin" className="rounded-full bg-white p-2 text-stone-400 shadow-sm">
            <Settings className="h-5 w-5" />
          </Link>
          <Link href="/login" className="rounded-full bg-white p-2 text-stone-400 shadow-sm">
            <LogOut className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <SectionHeader
        eyebrow="Ruang Keluarga"
        title="Selamat Datang, Keluarga Tercinta"
        description="Ruang hangat untuk melihat anggota keluarga, memahami relasi, dan menyimpan momen penting lintas generasi."
      />

      <div className="grid grid-cols-2 gap-4">
        <Link href="/keluarga" className="block">
          <Card className="flex h-full flex-col items-center justify-center gap-3 border-orange-100/70 bg-gradient-to-br from-amber-50 to-orange-50/60 p-6 text-center">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <Users className="h-8 w-8 text-amber-700" />
            </div>
            <div>
              <h3 className="font-medium text-stone-900">Anggota</h3>
              <p className="mt-1 text-xs text-stone-500">Lihat Direktori</p>
            </div>
          </Card>
        </Link>
        <Link href="/pohon" className="block">
          <Card className="flex h-full flex-col items-center justify-center gap-3 border-emerald-100/70 bg-gradient-to-br from-emerald-50 to-teal-50/60 p-6 text-center">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <TreeDeciduous className="h-8 w-8 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-medium text-stone-900">Pohon</h3>
              <p className="mt-1 text-xs text-stone-500">Mode Visual</p>
            </div>
          </Card>
        </Link>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-800">Cerita Keluarga</h2>
          <Link href="/timeline" className="text-sm font-medium text-amber-700">
            Lihat Semua
          </Link>
        </div>
        <Link href="/timeline" className="block">
          <Card className="flex items-center gap-4 p-4">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-stone-900">Buka Timeline Keluarga</h3>
              <p className="mt-1 text-sm text-stone-500">
                Jelajahi memori keluarga yang sudah ditulis dan tersusun rapi menurut waktu.
              </p>
            </div>
          </Card>
        </Link>
      </section>

      <Card className="space-y-3 p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-stone-900">Mulai dari alur paling sederhana</h3>
        <p className="text-base leading-relaxed text-stone-600">
          Untuk melihat data, gunakan menu <strong>Keluarga</strong>, <strong>Pohon</strong>, atau{" "}
          <strong>Cerita</strong>. Untuk mengubah data, gunakan akun dengan izin editor/admin.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href="/keluarga">
            <Button>Buka Direktori Keluarga</Button>
          </Link>
          <Link href="/anggota-baru">
            <Button variant="secondary">Tambah Anggota (Editor/Admin)</Button>
          </Link>
        </div>
      </Card>

      <InstallAppPrompt />
    </section>
  );
}
