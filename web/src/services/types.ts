/**
 * Matches Laravel's paginated response structure.
 * All endpoints using ->paginate() return this shape.
 */
export interface PaginatedResponse<T> {
  data: T[]
  links?: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta?: {
    current_page: number
    from: number | null
    last_page: number
    path: string
    per_page: number
    to: number | null
    total: number
  }
  // Laravel also puts these at root level for some paginator types
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
}

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T> {
  data: T
  message?: string
}
