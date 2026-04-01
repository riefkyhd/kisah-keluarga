import Link from "next/link";

type MemberSearchFormProps = {
  value: string;
};

export function MemberSearchForm({ value }: MemberSearchFormProps) {
  const hasQuery = value.length > 0;

  return (
    <form action="/keluarga" method="get" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="space-y-2">
        <label htmlFor="directory-search" className="text-sm font-semibold text-slate-900">
          Cari nama atau panggilan
        </label>
        <input
          id="directory-search"
          name="q"
          defaultValue={value}
          placeholder="Contoh: Rina, Pak Budi, atau panggilan"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400"
        />
      </div>
      <p className="text-sm text-slate-600">
        Ketik sebagian nama untuk menemukan anggota keluarga lebih cepat.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-white"
        >
          Cari
        </button>
        {hasQuery ? (
          <Link
            href="/keluarga"
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Reset
          </Link>
        ) : null}
      </div>
    </form>
  );
}
