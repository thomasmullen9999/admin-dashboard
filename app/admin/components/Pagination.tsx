export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <a href={`/admin?page=${currentPage - 1}`}>Prev</a> |{" "}
      <a href={`/admin?page=${currentPage + 1}`}>Next</a>
    </div>
  );
}
