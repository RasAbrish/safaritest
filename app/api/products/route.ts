import { NextRequest, NextResponse } from "next/server";
import type { ProductsResponse } from "@/types/product";

const allowedSortFields = new Set(["title", "price", "rating", "stock"]);
const allowedOrders = new Set(["asc", "desc"]);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const limit = Number(params.get("limit") ?? 10);
  const skip = Number(params.get("skip") ?? 0);
  const q = (params.get("q") ?? "").trim();
  const sortBy = params.get("sortBy") ?? "title";
  const order = params.get("order") ?? "asc";

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    return NextResponse.json({ error: "Limit must be an integer between 1 and 50" }, { status: 400 });
  }

  if (!Number.isInteger(skip) || skip < 0) {
    return NextResponse.json({ error: "Skip must be a non-negative integer" }, { status: 400 });
  }

  if (!allowedSortFields.has(sortBy)) {
    return NextResponse.json({ error: "Unsupported sort field" }, { status: 400 });
  }

  if (!allowedOrders.has(order)) {
    return NextResponse.json({ error: "Sort order must be asc or desc" }, { status: 400 });
  }

  const upstreamParams = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
    sortBy,
    order
  });
  const path = q ? "/products/search" : "/products";
  if (q) upstreamParams.set("q", q);

  try {
    const baseUrl = process.env.PRODUCTS_API_URL ?? "https://dummyjson.com";
    const response = await fetch(`${baseUrl}${path}?${upstreamParams}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Product service is unavailable" }, { status: response.status });
    }

    const data = (await response.json()) as ProductsResponse;
    return NextResponse.json(data, {
      headers: { "X-Total-Count": String(data.total) }
    });
  } catch {
    return NextResponse.json({ error: "Could not connect to the product service" }, { status: 502 });
  }
}
