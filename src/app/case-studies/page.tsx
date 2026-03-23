import { CaseStudiesSection } from "@/components/News&Updates/CaseStudies";

export default function CaseStudiesPage() {
    // Reuse the same section UI, but show all posts on the dedicated page.
    return <CaseStudiesSection showAllPosts showSeeMoreButton={false} />;
}
