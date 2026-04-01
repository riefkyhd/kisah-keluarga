import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getDevDummyLoginContext, sanitizeInternalNextPath } from "@/server/dev-auth/config";

type DevLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid_form: "Form login dummy belum valid. Pilih role yang tersedia.",
  env_missing: "Konfigurasi env belum lengkap untuk mode login dummy.",
  bootstrap_failed: "Bootstrap login dummy belum berhasil. Coba lagi sebentar."
};

export default async function DevLoginPage({ searchParams }: DevLoginPageProps) {
  const requestHeaders = await headers();
  const context = getDevDummyLoginContext(requestHeaders);

  if (!context.routeAllowed) {
    notFound();
  }

  const params = await searchParams;
  const nextPath = sanitizeInternalNextPath(params.next);
  const errorMessage = params.error ? errorMessages[params.error] : "";

  return (
    <section className="mx-auto w-full max-w-md space-y-4">
      <p className="text-sm font-medium uppercase tracking-wide text-amber-700">Mode Pengujian Lokal</p>
      <h2 data-testid="dev-login-heading" className="text-2xl font-semibold leading-tight text-slate-900">
        Masuk Cepat untuk QA Lokal
      </h2>
      <p className="text-base leading-relaxed text-slate-700">
        Halaman ini hanya untuk lingkungan lokal. Jangan aktifkan pada lingkungan publik atau produksi.
      </p>

      {errorMessage ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      {!context.envReady ? (
        <div className="space-y-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
          <p>Mode login dummy aktif, tetapi env berikut belum diisi:</p>
          <ul className="list-disc space-y-1 pl-5">
            {context.missingEnv.map((envName) => (
              <li key={envName}>{envName}</li>
            ))}
          </ul>
        </div>
      ) : (
        <form
          action="/dev-login/start"
          method="get"
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
        >
          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Peran akun dummy
            <select
              name="role"
              defaultValue="viewer"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-800">
            Tujuan setelah login (opsional)
            <input
              name="next"
              defaultValue={nextPath}
              placeholder="/keluarga"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-amber-500 px-4 py-3 text-base font-semibold text-white"
          >
            Masuk sebagai akun dummy
          </button>
        </form>
      )}

      <Link href="/login" className="inline-block text-sm font-medium text-amber-700">
        ← Kembali ke login normal
      </Link>
    </section>
  );
}
