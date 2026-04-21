const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100', 'all'];

function computeRange(total, page, pageSize) {
  if (total <= 0) return { start: 0, end: 0 };
  if (pageSize === 'all') return { start: 1, end: total };
  const perPage = Number(pageSize);
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : total;
  const start = (page - 1) * safePerPage + 1;
  const end = Math.min(total, start + safePerPage - 1);
  return { start, end };
}

export default function TablePager({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(total / Number(pageSize || 10)));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const { start, end } = computeRange(total, safePage, pageSize);

  return (
    <div className="table-pager">
      <label className="table-pager-left" htmlFor="table-pager-size">
        Display
        <select
          id="table-pager-size"
          className="form-select-inline"
          value={pageSize}
          onChange={(e) => onPageSizeChange(e.target.value)}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === 'all' ? 'All' : option}
            </option>
          ))}
        </select>
        records per page
      </label>

      <div className="table-pager-right">
        <span className="table-pager-count">
          {start} - {end} of {total}
        </span>
        <button
          type="button"
          className="table-pager-btn"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1 || total === 0}
        >
          Previous
        </button>
        <span className="table-pager-page">{safePage}</span>
        <button
          type="button"
          className="table-pager-btn"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages || total === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}
