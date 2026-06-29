"use client";

import { Download, Search } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProducts } from "@/hooks/use-products";
import { exportProducts } from "@/lib/export-products";
import type { ProductQuery } from "@/types/product";

const sortOptions = [
  { label: "Name A-Z", sortBy: "title", order: "asc" },
  { label: "Name Z-A", sortBy: "title", order: "desc" },
  { label: "Lowest price", sortBy: "price", order: "asc" },
  { label: "Highest price", sortBy: "price", order: "desc" },
  { label: "Highest rating", sortBy: "rating", order: "desc" },
  { label: "Most stock", sortBy: "stock", order: "desc" }
] as const;

export function ProductBrowser() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [query, setQuery] = useState<ProductQuery>({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "title",
    order: "asc"
  });

  useEffect(() => {
    setQuery((current) => ({ ...current, page: 1, search: deferredSearch }));
  }, [deferredSearch]);

  const { data, error, isLoading, isFetching, refetch } = useProducts(query);
  const pageCount = Math.max(1, Math.ceil((data?.total ?? 0) / query.limit));
  const start = data?.total ? (query.page - 1) * query.limit + 1 : 0;
  const end = Math.min(query.page * query.limit, data?.total ?? 0);

  function changeSort(value: string) {
    const option = sortOptions[Number(value)];
    setQuery((current) => ({
      ...current,
      page: 1,
      sortBy: option.sortBy,
      order: option.order
    }));
  }

  return (
    <main className="mx-auto max-w-6xl p-4 py-10 sm:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Product List</h1>
          <p className="mt-1 text-sm text-muted-foreground">Search, sort, paginate and export products.</p>
        </div>
        <Button
          onClick={() => data?.products && exportProducts(data.products)}
          disabled={!data?.products.length}
        >
          <Download /> Export Excel
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Products</CardTitle>
          <CardDescription>{data?.total ?? 0} products available</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="flex flex-col gap-3 border-b p-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products"
                aria-label="Search products"
                className="pl-9"
              />
            </div>

            <NativeSelect className="w-full md:w-48" onChange={(event) => changeSort(event.target.value)} aria-label="Sort products">
              {sortOptions.map((option, index) => (
                <NativeSelectOption value={index} key={option.label}>{option.label}</NativeSelectOption>
              ))}
            </NativeSelect>

            <NativeSelect
              className="w-full md:w-36"
              value={query.limit}
              onChange={(event) => setQuery((current) => ({
                ...current,
                page: 1,
                limit: Number(event.target.value)
              }))}
              aria-label="Products per page"
            >
              {[5, 10, 20, 40].map((size) => (
                <NativeSelectOption value={size} key={size}>{size} per page</NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          {isLoading ? (
            <div className="p-16 text-center text-sm text-muted-foreground">Loading products...</div>
          ) : error ? (
            <div className="space-y-3 p-16 text-center" role="alert">
              <p className="text-sm text-destructive">{error.message}</p>
              <Button variant="outline" onClick={() => refetch()}>Try again</Button>
            </div>
          ) : data?.products.length === 0 ? (
            <div className="p-16 text-center text-sm text-muted-foreground">No products found.</div>
          ) : (
            <div className={isFetching ? "opacity-50" : ""}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.id}</TableCell>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.rating.toFixed(1)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {data && data.total > 0 && !error && (
            <div className="flex flex-col items-center justify-between gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row">
              <span>Showing {start}-{end} of {data.total}</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={query.page === 1}
                  onClick={() => setQuery((current) => ({ ...current, page: current.page - 1 }))}
                >
                  Previous
                </Button>
                <span>Page {query.page} of {pageCount}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={query.page >= pageCount}
                  onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
