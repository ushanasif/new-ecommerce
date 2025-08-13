import { Button } from "../ui/button"


interface ProductPaginationProps {
  paginationPage: number
  paginationPages: number
  page: number
  setPage: (page: number) => void
}

export default function ProductPagination({ paginationPage, paginationPages, page, setPage }: ProductPaginationProps) {
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page {paginationPage} of {paginationPages}
      </span>
      <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page === paginationPages}>
        Next
      </Button>
    </div>
  )
}
