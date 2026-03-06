import Rout from '@/components/WorkingGroupsPage/ListRoutWorking/Rout'

type PageProps = {
    params: { slug: string } | Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
    const resolvedParams = await Promise.resolve(params)
    const pageSlug = resolvedParams.slug

    return <Rout pageSlug={pageSlug} />
}
