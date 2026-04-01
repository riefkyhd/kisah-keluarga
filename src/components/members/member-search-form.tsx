import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type MemberSearchFormProps = {
  value: string;
};

export function MemberSearchForm({ value }: MemberSearchFormProps) {
  const hasQuery = value.length > 0;

  return (
    <Card className="rounded-[2rem] border-stone-100 p-5 sm:p-6">
      <form action="/keluarga" method="get" className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="directory-search" className="text-base font-semibold text-stone-900">
            Cari nama atau panggilan
          </label>
          <input
            id="directory-search"
            name="q"
            defaultValue={value}
            placeholder="Contoh: Rina, Pak Budi, atau panggilan"
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-base text-stone-900 outline-none ring-amber-200 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2"
          />
        </div>

        <p className="text-sm leading-relaxed text-stone-600">
          Anda boleh mengetik sebagian nama agar hasil muncul lebih cepat.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button type="submit">Cari</Button>
          {hasQuery ? (
            <Link
              href="/keluarga"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-stone-200 bg-white px-5 py-3 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50"
            >
              Reset
            </Link>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
