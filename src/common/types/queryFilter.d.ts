import { FindManyOptions } from 'typeorm';

/**
 * Generic filter type for building TypeORM query options.
 *
 * @template T Entity type
 */
export type QueryFilterType<T = any> = {
  where?: {
    [P in keyof T]?: T[P] | ConditionValue;
  };
  order?: {
    [P in keyof T]?: 'ASC' | 'DESC';
  };
  skip?: number;
  take?: number;
} & FindManyOptions<T>;

/**
 * Supported operators for conditions.
 */
export type ConditionValue = {
  gt?: number | string | Date;
  lt?: number | string | Date;
  like?: string;
};
