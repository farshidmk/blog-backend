import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Prisma } from '@prisma/client'; // ← import this
import { QueryFilterType } from '../types/queryFilter'; // adjust path

// Change this type to match your needs
// Usually: type QueryFilterResult<T> = {
//   where?: Prisma.Args<T, 'findMany'>['where'];
//   orderBy?: Prisma.Args<T, 'findMany'>['orderBy'];
//   skip?: number;
//   take?: number;
// }

export const QueryFilter = <T extends { new (...args: any[]): any }>(
  // We use the model class / delegate type, e.g. Prisma.UserDelegate
  // But most people pass the delegate or just use string model name
  model: Prisma.ModelName, // ← 'User' | 'Post' | 'Product' etc.
) =>
  createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const filterString = request.query.filter;

    let filter: QueryFilterType<T> = {};
    if (filterString) {
      try {
        filter = JSON.parse(filterString);
      } catch (err) {
        throw new BadRequestException('Invalid filter JSON format');
      }
    }

    // ── Get allowed fields from Prisma Client ────────────────────────────────
    // This is the recommended way in 2024–2026
    const prismaClient = request.prisma || globalThis.prisma; // adjust how you access prisma
    if (!prismaClient) {
      throw new Error('Prisma client not available in request');
    }

    // Example: prismaClient.user.fields → but better to use runtime introspection or static map
    // For simplicity we often maintain a map or use a helper function.
    // Here we'll assume you have access to fields via a helper or hardcode per entity.

    // === Most maintainable solution: pass fields explicitly or use a map ===

    // For now we'll simulate – replace with real implementation
    const validFields = getPrismaFieldsForModel(model); // ← implement this!

    const where: Record<string, any> = {};
    const orderBy: Record<string, 'asc' | 'desc'>[] = []; // Prisma likes array for orderBy

    // WHERE clause
    if (filter?.where) {
      for (const [key, value] of Object.entries(filter.where)) {
        if (!validFields.includes(key)) {
          throw new BadRequestException(`Invalid filter field: ${key}`);
        }

        where[key] = parsePrismaCondition(value);
      }
    }

    // ORDER clause
    if (filter?.order) {
      for (const [key, direction] of Object.entries(filter.order)) {
        if (!validFields.includes(key)) {
          throw new BadRequestException(`Invalid sort field: ${key}`);
        }

        const dir = String(direction).toUpperCase() === 'DESC' ? 'desc' : 'asc';
        orderBy.push({ [key]: dir });
      }
    }

    const skip = filter?.skip ? Number(filter.skip) : undefined;
    const take = filter?.take ? Number(filter.take) : 10;

    // Return Prisma-compatible object
    return {
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: orderBy.length > 0 ? orderBy : undefined,
      skip,
      take,
    } as Prisma.Args<ReturnType<typeof prismaClient>, 'findMany'>;
  })();

// ── Parse LoopBack-style conditions to Prisma ───────────────────────────────
function parsePrismaCondition(value: any): any {
  if (typeof value !== 'object' || value === null) {
    return value; // exact match
  }

  const conditions: Record<string, any> = {};

  if ('gt' in value) conditions.gt = value.gt;
  if ('gte' in value) conditions.gte = value.gte;
  if ('lt' in value) conditions.lt = value.lt;
  if ('lte' in value) conditions.lte = value.lte;
  if ('like' in value) conditions.contains = value.like; // ← note: no % added!

  // Optional: support more operators
  if ('contains' in value) conditions.contains = value.contains;
  if ('startsWith' in value) conditions.startsWith = value.startsWith;
  if ('endsWith' in value) conditions.endsWith = value.endsWith;

  // You can add in, notIn, equals, not, etc.

  return Object.keys(conditions).length === 1 && 'contains' in conditions
    ? { contains: conditions.contains } // most common case
    : conditions;
}

// Helper – implement according to your needs
function getPrismaFieldsForModel(modelName: Prisma.ModelName): string[] {
  // Option A: Hardcode per model (most reliable)
  const fieldMap: Record<string, string[]> = {
    User: ['id', 'email', 'name', 'createdAt', 'age', 'role'],
    Post: ['id', 'title', 'content', 'published', 'authorId'],
    // ...
  };

  const fields = fieldMap[modelName];
  if (!fields) {
    throw new Error(`No field map defined for model ${modelName}`);
  }

  return fields;

  // Option B: Runtime reflection (advanced / less type-safe)
  // const dmmf = prismaClient._runtimeDataModel.models[modelName];
  // return Object.keys(dmmf.fields);
}
