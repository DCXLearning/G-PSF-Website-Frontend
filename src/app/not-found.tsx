// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-screen -mt-14 bg-[#ffffff] flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-[120px] sm:text-[160px] md:text-[200px] font-extrabold leading-none bg-gradient-to-b from-gray-700 to-gray-300 bg-clip-text text-transparent">
                    404
                </h1>

                <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-black">
                    Something&apos;s missing
                </h2>

                <p className="mt-4 text-gray-700 text-base sm:text-lg">
                    Sorry, the page you are looking for doesn&apos;t exist or has been moved.
                </p>

                <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
                    <Link
                        href="/"
                        className="rounded-md bg-[#7bc300] hover:bg-[#6aae00] text-white font-medium px-6 py-3 transition"
                    >
                        Go back
                    </Link>

                    <Link
                        href="/"
                        className="text-gray-800 font-medium hover:underline"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}