import Link from "next/link";
import { headers } from "next/headers";
import { requestMagicLink } from "./actions";
import { getDevDummyLoginContext } from "@/server/dev-auth/config";

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
    <section className="mx-auto w-full max-w-md space-y-5">
      <p className="text-sm font-medium uppercase tracking-wide text-amber-700">
        Login Keluarga
      </p>
      <h2 className="text-2xl font-semibold leading-tight text-slate-900">
        Masuk dengan link sekali klik
      </h2>
      <p className="text-base leading-relaxed text-slate-700">
        Masukkan email Anda. Kami akan kirim tautan login yang aman dan mudah
        dipakai dari HP.
      </p>
      <p className="text-sm leading-relaxed text-slate-600">
        Jika email belum masuk, tunggu sebentar lalu cek folder spam/promosi.
      </p>

      {hasSentLink ? (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          Link login sudah dikirim. Silakan cek email Anda.
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      <form action={requestMagicLink} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <input type="hidden" name="next" value={nextPath} />

        <label className="block space-y-2 text-base font-semibold text-slate-800">
          Email
          <input
            required
            autoComplete="email"
            type="email"
            name="email"
            placeholder="nama@keluarga.com"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-amber-500 px-4 py-3 text-base font-semibold text-white"
        >
          Kirim Link Login
        </button>
      </form>

      {devDummyLogin.canUse ? (
        <div className="rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">Butuh login cepat untuk QA lokal?</p>
          <Link
            href={`/dev-login?next=${encodeURIComponent(nextPath)}`}
            className="mt-2 inline-block rounded-md px-1 py-1 text-sm font-semibold text-amber-700"
          >
            Buka Mode Pengujian Lokal
          </Link>
        </div>
      ) : null}
    </section>
  );
}
