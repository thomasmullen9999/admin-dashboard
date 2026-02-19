"use client";

export default function PaginationDropdown({
  initialItemsPerPage,
}: {
  initialItemsPerPage: number;
}) {
  return (
    <select defaultValue={initialItemsPerPage}>
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
    </select>
  );
}
