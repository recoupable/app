/**
 * Client-side function to delete trailing messages after a specific memory
 * @param id The ID of the memory to delete messages after
 * @returns A promise that resolves when the operation is complete
 */
export async function clientDeleteTrailingMessages({
  id,
}: {
  id: string;
}): Promise<boolean> {
  const response = await fetch(
    `/api/memories/delete-trailing?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error(errorData.error || "Failed to delete trailing messages");
    return false;
  }

  return true;
}
