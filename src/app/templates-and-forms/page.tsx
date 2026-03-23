import { ToolsSectionContent } from "@/components/ResourcesPage/ToolsSection";

export default function TemplatesAndFormsPage() {
    // Reuse the same tools section UI and show all posts here.
    return <ToolsSectionContent showAllPosts showSeeMoreButton={false} />;
}
