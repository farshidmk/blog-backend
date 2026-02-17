import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { QueryFilterType } from '../types/queryFilter';

type QueryFilterResult = {
  where?: Record<string, unknown>;
  orderBy?: Record<string, 'asc' | 'desc'>[];
  skip?: number;
  take?: number;
};

export const QueryFilter = (model: Prisma.ModelName) =>
  createParamDecorator((_: unknown, ctx: ExecutionContext): QueryFilterResult => {
    const request = ctx.switchToHttp().getRequest();
    const rawFilter = request.query?.filter;

    let filter: QueryFilterType = {};
    if (rawFilter !== undefined) {
      if (typeof rawFilter === 'string') {
        try {
          filter = JSON.parse(rawFilter) as QueryFilterType;
        } catch {
          throw new BadRequestException('Invalid filter JSON format');
        }
      } else if (typeof rawFilter === 'object' && rawFilter !== null) {
        filter = rawFilter as QueryFilterType;
      } else {
        throw new BadRequestException('Invalid filter format');
      }
    }

    const validFields = getPrismaFieldsForModel(model);

    const where: Record<string, unknown> = {};
    const orderBy: Record<string, 'asc' | 'desc'>[] = [];

    if (filter.where) {
      for (const [key, value] of Object.entries(filter.where)) {
        if (!validFields.includes(key)) {
          throw new BadRequestException(`Invalid filter field: ${key}`);
        }

        where[key] = parsePrismaCondition(value);
      }
    }

    parseOrder(filter.order, validFields, orderBy);

    const skip = toNonNegativeInt(filter.skip, 'skip');
    const take = toPositiveInt(filter.take, 'take');

    return {
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: orderBy.length > 0 ? orderBy : undefined,
      skip,
      take,
    };
  })();

function parsePrismaCondition(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  const raw = value as Record<string, unknown>;
  const conditions: Record<string, unknown> = {};

  if ('gt' in raw) conditions.gt = raw.gt;
  if ('gte' in raw) conditions.gte = raw.gte;
  if ('lt' in raw) conditions.lt = raw.lt;
  if ('lte' in raw) conditions.lte = raw.lte;
  if ('like' in raw) conditions.contains = raw.like;
  if ('contains' in raw) conditions.contains = raw.contains;
  if ('startsWith' in raw) conditions.startsWith = raw.startsWith;
  if ('endsWith' in raw) conditions.endsWith = raw.endsWith;
  if ('in' in raw) conditions.in = raw.in;
  if ('notIn' in raw) conditions.notIn = raw.notIn;
  if ('equals' in raw) conditions.equals = raw.equals;
  if ('not' in raw) conditions.not = raw.not;

  return Object.keys(conditions).length > 0 ? conditions : value;
}

function getPrismaFieldsForModel(modelName: Prisma.ModelName): string[] {
  const prismaAny = Prisma as unknown as {
    dmmf?: {
      datamodel?: {
        models?: Array<{ name: string; fields: Array<{ name: string }> }>;
      };
    };
  };

  const models = prismaAny.dmmf?.datamodel?.models ?? [];
  const model = models.find((m) => m.name === modelName);

  if (!model) {
    throw new BadRequestException(
      `No Prisma metadata found for model: ${modelName}`,
    );
  }

  return model.fields.map((f) => f.name);
}

function parseOrder(
  rawOrder: QueryFilterType['order'],
  validFields: string[],
  orderBy: Record<string, 'asc' | 'desc'>[],
) {
  if (!rawOrder) return;

  if (typeof rawOrder === 'string') {
    parseOrderEntry(rawOrder, validFields, orderBy);
    return;
  }

  if (Array.isArray(rawOrder)) {
    for (const entry of rawOrder) {
      parseOrderEntry(entry, validFields, orderBy);
    }
    return;
  }

  for (const [field, direction] of Object.entries(rawOrder)) {
    if (!validFields.includes(field)) {
      throw new BadRequestException(`Invalid sort field: ${field}`);
    }

    orderBy.push({ [field]: normalizeDirection(direction) });
  }
}

function parseOrderEntry(
  entry: string,
  validFields: string[],
  orderBy: Record<string, 'asc' | 'desc'>[],
) {
  const [field, rawDirection] = entry.trim().split(/\s+/);

  if (!field || !validFields.includes(field)) {
    throw new BadRequestException(`Invalid sort field: ${field ?? entry}`);
  }

  orderBy.push({ [field]: normalizeDirection(rawDirection ?? 'asc') });
}

function normalizeDirection(value: unknown): 'asc' | 'desc' {
  const dir = String(value).toLowerCase();

  if (dir === 'asc') return 'asc';
  if (dir === 'desc') return 'desc';

  throw new BadRequestException('Invalid sort direction. Use ASC or DESC');
}

function toNonNegativeInt(value: unknown, key: string): number | undefined {
  if (value === undefined || value === null) return undefined;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new BadRequestException(`${key} must be a non-negative integer`);
  }

  return parsed;
}

function toPositiveInt(value: unknown, key: string): number | undefined {
  if (value === undefined || value === null) return undefined;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestException(`${key} must be a positive integer`);
  }

  return parsed;
}
