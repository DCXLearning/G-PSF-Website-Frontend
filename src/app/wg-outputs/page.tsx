import { WGOutputsSection } from "@/components/ResourcesPage/WG_Outputs";

export default function WGOutputsPage() {
    // Reuse the same WG Outputs UI and show all posts on this page.
    return <WGOutputsSection showAllPosts showSeeMoreButton={false} />;
}
