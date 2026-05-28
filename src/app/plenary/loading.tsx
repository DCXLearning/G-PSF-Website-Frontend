function TextLine({ className = "" }: { className?: string }) {
    return <div className={`rounded bg-slate-200 ${className}`} />;
}

export default function PlenaryLoading() {
    return (
        <div className="bg-white">
            <section className="mx-auto max-w-full overflow-hidden bg-white shadow-2xl">
                <div className="mx-auto max-w-5xl animate-pulse px-6 pt-8 pb-6 text-center sm:px-8 md:px-8">
                    <TextLine className="mx-auto h-10 w-4/5 max-w-3xl md:h-12" />
                    <TextLine className="mx-auto mt-4 h-5 w-3/5 max-w-2xl" />
                </div>

                <div className="h-[260px] w-full animate-pulse bg-slate-200 sm:h-[400px] md:h-[550px] lg:h-[700px] xl:h-[820px]" />
            </section>

            <section className="py-16 md:py-24">
                <div className="mx-auto grid max-w-7xl animate-pulse grid-cols-1 gap-14 px-4 lg:grid-cols-2 lg:gap-20">
                    <div>
                        <TextLine className="h-12 w-56 md:h-14" />
                        <TextLine className="mt-4 h-12 w-44 md:h-14" />
                        <div className="mt-5 h-1.5 w-56 bg-orange-300 sm:w-72 md:w-96 lg:w-[360px]" />
                        <TextLine className="mt-8 h-5 w-full max-w-md" />
                        <TextLine className="mt-3 h-5 w-5/6 max-w-sm" />
                        <TextLine className="mt-3 h-5 w-2/3 max-w-xs" />
                    </div>

                    <div className="space-y-6 lg:pt-24 xl:pt-80">
                        <TextLine className="mb-10 h-12 w-64" />
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="flex items-start gap-6">
                                <div className="h-12 w-12 rounded-full bg-slate-200" />
                                <div className="flex-1 pt-1">
                                    <TextLine className="h-6 w-full max-w-md" />
                                    <TextLine className="mt-2 h-4 w-5/6 max-w-sm" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
