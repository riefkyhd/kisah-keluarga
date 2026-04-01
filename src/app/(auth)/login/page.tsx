import Link from "next/link";
import { Heart } from "lucide-react";
import { headers } from "next/headers";
import { requestMagicLink } from "./actions";
import { getDevDummyLoginContext } from "@/server/dev-auth/config";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBanner } from "@/components/ui/status-banner";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    sent?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid_email: "Alamat email belum valid. Coba periksa lagi.",
  send_failed:
    "Link login belum bisa dikirim. Coba lagi sebentar, atau periksa konfigurasi Supabase Auth.",
  callback_failed:
    "Link login tidak valid atau sudah kedaluwarsa. Silakan minta link baru."
};

function sanitizeNextPath(next: string | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const requestHeaders = await headers();
  const devDummyLogin = getDevDummyLoginContext(requestHeaders);
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);
  const hasSentLink = params.sent === "1";
  const errorMessage = params.error ? errorMessages[params.error] : "";

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-10rem)] w-full max-w-md items-center py-4">
      <Card className="w-full space-y-6 rounded-[2.5rem] border-stone-100 p-6 text-center sm:p-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50">
          <Heart className="h-10 w-10 fill-amber-700 text-amber-700" />
        </div>

        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-amber-700">Login Keluarga</p>
          <h2 className="text-3xl font-semibold leading-tight text-stone-900">Masuk dengan link sekali klik</h2>
          <p className="text-base leading-relaxed text-stone-600">
            Masukkan email Anda. Kami akan kirim tautan login yang aman dan mudah dipakai dari HP.
          </p>
          <p className="text-sm leading-relaxed text-stone-500">
            Jika email belum masuk, tunggu sebentar lalu cek folder spam/promosi.
          </p>
        </header>

        {hasSentLink ? (
          <StatusBanner variant="success" message="Link login sudah dikirim. Silakan cek email Anda." />
        ) : null}

        {errorMessage ? <StatusBanner variant="error" message={errorMessage} /> : null}

        <form action={requestMagicLink} className="space-y-4 text-left">
          <input type="hidden" name="next" value={nextPath} />

          <label className="block space-y-2 text-base font-semibold text-stone-800">
            Alamat Email
            <input
              required
              autoComplete="email"
              type="email"
              name="email"
              placeholder="nama@keluarga.com"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-base text-stone-900 outline-none ring-amber-200 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2"
            />
          </label>

          <Button type="submit" className="w-full">
            Kirim Link Login
          </Button>
        </form>

        <p className="text-sm leading-relaxed text-stone-500">
          Hanya anggota keluarga yang diundang yang dapat mengakses.
        </p>

        {devDummyLogin.canUse ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-left text-sm text-stone-700">
            <p className="font-medium text-stone-900">Butuh login cepat untuk QA lokal?</p>
            <Link
              href={`/dev-login?next=${encodeURIComponent(nextPath)}`}
              className="mt-2 inline-block rounded-md py-1 text-sm font-semibold text-amber-700"
            >
              Buka Mode Pengujian Lokal
            </Link>
          </div>
        ) : null}
      </Card>
    </section>
  );
}
