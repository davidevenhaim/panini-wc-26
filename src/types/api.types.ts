export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ApiError = {
  message: string;
  statusCode: number;
  code?: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type SortOrder = "asc" | "desc";

export type SortParams = {
  sortBy: string;
  order: SortOrder;
};
