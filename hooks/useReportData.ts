import { useQuery } from "@tanstack/react-query";
import { ReportData } from "@/components/Chat/ChatReport/types";

/**
 * Checks if a report is complete by verifying both report and next_steps are available
 *
 * @param data
 */
const isReportComplete = (data: ReportData | undefined): boolean => {
  return Boolean(data?.report && data?.next_steps);
};

const fetchReport = async (reportId: string): Promise<ReportData> => {
  const response = await fetch(`/api/segment_report?reportId=${reportId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch report: ${response.statusText}`);
  }
  const json = await response.json();
  return json.data;
};

export const useReportData = (reportId: string) => {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: () => fetchReport(reportId),
    refetchInterval: query => {
      const data = query.state.data;
      return isReportComplete(data) ? false : 3000;
    },
    enabled: !!reportId,
    retry: 3,
    staleTime: 1000, // Consider data stale after 1 second
  });
};
