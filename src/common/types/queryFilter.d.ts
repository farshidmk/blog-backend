export type QueryFilterType = {
  where?: Record<string, unknown>;
  order?:
    | Record<string, 'ASC' | 'DESC' | 'asc' | 'desc'>
    | string[]
    | string;
  skip?: number;
  take?: number;
};
