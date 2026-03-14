import { Tables } from "@/types/database.types";

type Catalog = Tables<"catalogs">;

export interface CatalogsResponse {
  status: string;
  catalogs: Catalog[];
  error?: string;
}

/**
 *
 * @param accountId
 */
export async function getCatalogs(accountId: string): Promise<CatalogsResponse> {
  try {
    const response = await fetch(
      `https://api.recoupable.com/api/catalogs?account_id=${accountId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: CatalogsResponse = await response.json();

    if (data.status === "error") {
      throw new Error(data.error || "Unknown error occurred");
    }

    return data;
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    throw error;
  }
}
