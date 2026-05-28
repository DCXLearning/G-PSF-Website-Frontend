function TextLine({ className = "" }: { className?: string }) {
    return <div className={`rounded bg-slate-200 ${className}`} />;
}

function AboutUsLoading() {
    return (
        <main className="bg-white">
            <section className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 animate-pulse text-center">
                        <TextLine className="mx-auto h-10 w-4/5 max-w-2xl md:h-12" />
                        <TextLine className="mx-auto mt-4 h-5 w-3/5 max-w-xl" />
                    </div>
                </div>

                <div className="h-[240px] w-full animate-pulse bg-slate-200 sm:h-[360px] md:h-[480px] lg:h-[675px]" />
            </section>

            <section className="py-16 md:py-24">
                <div className="mx-auto grid max-w-7xl animate-pulse grid-cols-1 gap-14 px-4 lg:grid-cols-2 lg:gap-20">
                    <div>
                        <TextLine className="mb-3 h-4 w-24" />
                        <TextLine className="mb-5 h-12 w-3/4" />
                        <div className="h-1.5 w-56 rounded bg-orange-300 sm:w-72 md:w-96" />
                        <TextLine className="mt-8 h-6 w-full max-w-md" />
                        <TextLine className="mt-3 h-6 w-5/6 max-w-sm" />
                    </div>

                    <div className="space-y-8">
                        <TextLine className="h-10 w-52" />
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex items-start gap-6">
                                <div className="h-12 w-12 rounded-full bg-slate-200" />
                                <div className="flex-1">
                                    <TextLine className="mb-3 h-7 w-56" />
                                    <TextLine className="mb-2 h-5 w-full max-w-sm" />
                                    <TextLine className="h-5 w-5/6 max-w-xs" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default AboutUsLoading;
