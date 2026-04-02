import { Card } from "@/components/ui/card";

export default function KeluargaLoading() {
  return (
    <section className="space-y-6" aria-live="polite" aria-busy="true">
      <div className="space-y-3">
        <div className="h-5 w-40 animate-pulse rounded-lg bg-stone-200" />
        <div className="h-8 w-72 animate-pulse rounded-lg bg-stone-200" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-lg bg-stone-200" />
      </div>

      <Card className="rounded-[2rem] border-stone-100 p-5 sm:p-6">
        <div className="space-y-3">
          <div className="h-5 w-48 animate-pulse rounded-lg bg-stone-200" />
          <div className="h-12 w-full animate-pulse rounded-2xl bg-stone-200" />
          <div className="h-4 w-64 animate-pulse rounded-lg bg-stone-200" />
        </div>
      </Card>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <li key={`directory-loading-${index}`}>
            <Card className="space-y-4 rounded-[1.5rem] border-stone-100 p-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 animate-pulse rounded-full bg-stone-200" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-5 w-3/4 animate-pulse rounded-lg bg-stone-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded-lg bg-stone-200" />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="h-4 animate-pulse rounded-lg bg-stone-200" />
                <div className="h-4 animate-pulse rounded-lg bg-stone-200" />
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
