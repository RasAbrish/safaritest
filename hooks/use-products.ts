"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ProductQuery, ProductsResponse } from "@/types/product";

async function getProducts(query: ProductQuery): Promise<ProductsResponse> {
  const params = new URLSearchParams({
    limit: String(query.limit),
    skip: String((query.page - 1) * query.limit),
    q: query.search,
    sortBy: query.sortBy,
    order: query.order
  });
  const response = await fetch(`/api/products?${params}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to load products");
  }

  return payload;
}

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: ["products", query],
    queryFn: () => getProducts(query),
    placeholderData: keepPreviousData
  });
}
