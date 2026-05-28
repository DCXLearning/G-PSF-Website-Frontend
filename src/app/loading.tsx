function TextLine({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-slate-200 ${className}`} />;
}

export default function HomeLoading() {
  return (
    <div className="bg-white">
      <section className="relative flex min-h-[680px] animate-pulse flex-col overflow-hidden bg-slate-200 md:min-h-[500px] lg:min-h-[650px]">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pb-20 pt-24 text-center md:pt-32">
          <TextLine className="h-10 w-4/5 max-w-3xl bg-slate-300 md:h-14" />
          <TextLine className="mt-5 h-10 w-3/5 max-w-2xl bg-slate-300 md:h-14" />
          <TextLine className="mt-8 h-6 w-5/6 max-w-4xl bg-slate-300 md:h-8" />
          <TextLine className="mt-3 h-6 w-2/3 max-w-3xl bg-slate-300 md:h-8" />
        </div>

        <div className="px-4 pb-8">
          <div className="mx-auto max-w-6xl">
            <div className="h-[2px] bg-white/80" />
            <div className="grid grid-cols-3 gap-4 py-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index}>
                  <div className="mx-auto h-10 w-20 rounded bg-white/45" />
                  <div className="mx-auto mt-3 h-4 w-24 rounded bg-white/45" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid animate-pulse grid-cols-1 gap-8 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-slate-100 p-6">
              <div className="mb-5 h-14 w-14 rounded-full bg-slate-200" />
              <TextLine className="mb-4 h-7 w-3/4" />
              <TextLine className="mb-2 h-5 w-full" />
              <TextLine className="h-5 w-5/6" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
