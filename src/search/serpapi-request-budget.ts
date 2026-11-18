export interface SerpApiRequestBudget {
  readonly maxRequests: number;
  usedRequests: number;
}

export function createSerpApiRequestBudget(
  maxRequests = 20,
): SerpApiRequestBudget {
  if (!Number.isInteger(maxRequests) || maxRequests < 1) {
    throw new Error('maxRequests must be a positive integer.');
  }

  return {
    maxRequests,
    usedRequests: 0,
  };
}