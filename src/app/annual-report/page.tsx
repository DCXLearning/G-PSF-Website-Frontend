import { AnnualReportsSection } from "@/components/PublicationPage/AnnualReports";

export default function AnnualReportPage() {
    // Reuse the same annual reports UI and show the full list on this page.
    return <AnnualReportsSection showAllItems showSeeMoreButton={false} />;
}
