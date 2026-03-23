import { SemesterReportsSection } from "@/components/ResourcesPage/Semester";

export default function SemesterReportsPage() {
    // Reuse the same UI and show the full semester reports list on this page.
    return <SemesterReportsSection showAllPosts showSeeMoreButton={false} />;
}
