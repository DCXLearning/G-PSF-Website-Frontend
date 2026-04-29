import Link from "next/link";
import {
    findImage,
    getItemDescription,
    getItemHref,
    getItemTitle,
    getPosts,
    getText,
    type JsonObject,
    type Lang,
} from "@/components/UI-Router/templates/dynamicTemplateUtils";

type PostListTemplateProps = {
    block: JsonObject;
    lang: Lang;
};

export default function PostListTemplate({ block, lang }: PostListTemplateProps) {
    const posts = getPosts(block);
    const title = getText(block.title, lang);
    const description = getText(block.description, lang);
    const isKh = lang === "kh";

    return (
        <section className="bg-[#f6f8fb] py-14 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {(title || description) ? (
                    <div className="mb-8 max-w-3xl">
                        {title ? (
                            <h2
                                className={`text-3xl font-extrabold text-[#1a2b4b] md:text-4xl ${
                                    isKh ? "khmer-font" : ""
                                }`}
                            >
                                {title}
                            </h2>
                        ) : null}

                        {description ? (
                            <p
                                className={`mt-4 text-base leading-8 text-slate-600 ${
                                    isKh ? "khmer-font" : ""
                                }`}
                            >
                                {description}
                            </p>
                        ) : null}
                    </div>
                ) : null}

                {posts.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post, index) => (
                            <PostCard
                                key={`${getText(post.id, lang) || index}`}
                                post={post}
                                lang={lang}
                            />
                        ))}
                    </div>
                ) : (
                    <p className={`text-slate-500 ${isKh ? "khmer-font" : ""}`}>
                        {isKh ? "មិនមានមាតិកាសម្រាប់បង្ហាញទេ។" : "No content to display."}
                    </p>
                )}
            </div>
        </section>
    );
}

function PostCard({ post, lang }: { post: JsonObject; lang: Lang }) {
    const title = getItemTitle(post, lang);
    const description = getItemDescription(post, lang);
    const image = findImage(post, lang);
    const href = getItemHref(post);
    const isKh = lang === "kh";

    const card = (
        <article className="h-full overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
            {image ? (
                <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                    <div
                        aria-label={title}
                        role="img"
                        className="h-full w-full bg-cover bg-center transition duration-500 hover:scale-105"
                        style={{ backgroundImage: `url(${image})` }}
                    />
                </div>
            ) : null}

            <div className="p-6">
                <h3
                    className={`line-clamp-2 text-xl font-extrabold leading-snug text-[#1a2b4b] ${
                        isKh ? "khmer-font" : ""
                    }`}
                >
                    {title}
                </h3>

                {description ? (
                    <p
                        className={`mt-3 line-clamp-3 text-sm leading-7 text-slate-600 ${
                            isKh ? "khmer-font" : ""
                        }`}
                    >
                        {description}
                    </p>
                ) : null}

                {href ? (
                    <p
                        className={`mt-5 text-sm font-bold text-[#1D69B4] ${
                            isKh ? "khmer-font" : ""
                        }`}
                    >
                        {isKh ? "មើលបន្ថែម" : "View more"}
                    </p>
                ) : null}
            </div>
        </article>
    );

    if (!href) {
        return card;
    }

    return (
        <Link href={href} className="block h-full">
            {card}
        </Link>
    );
}
