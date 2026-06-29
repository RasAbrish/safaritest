"use client";

import Image from "next/image";
import { Download, PackageOpen, RefreshCw, Search, SlidersHorizontal, Star } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { exportProducts } from "@/lib/export-products";
import type { ProductQuery } from "@/types/product";

const sortOptions = [
  { label: "Name: A–Z", sortBy: "title", order: "asc" },
  { label: "Name: Z–A", sortBy: "title", order: "desc" },
  { label: "Price: Low to high", sortBy: "price", order: "asc" },
  { label: "Price: High to low", sortBy: "price", order: "desc" },
  { label: "Highest rated", sortBy: "rating", order: "desc" },
  { label: "Most in stock", sortBy: "stock", order: "desc" }
] as const;

function LoadingRows() {
  return (
    <div className="product-grid" aria-label="Loading products">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="product-card skeleton-card" key={index}>
          <div className="skeleton skeleton-image" />
          <div className="card-content">
            <div className="skeleton skeleton-short" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductBrowser() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [query, setQuery] = useState<ProductQuery>({
    page: 1,
    limit: 8,
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

  const updateSort = (value: string) => {
    const option = sortOptions[Number(value)];
    setQuery((current) => ({
      ...current,
      page: 1,
      sortBy: option.sortBy,
      order: option.order
    }));
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Stockroom home">
          <span className="brand-mark">S</span>
          <span>Stockroom</span>
        </a>
        <span className="api-status"><i /> Live catalog</span>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span>Catalog</span><b>{data?.total ?? "—"} products</b></div>
        <h1>Find what you need.<br /><em>Skip what you don’t.</em></h1>
        <p>Browse the complete product collection, compare details, and export exactly what’s on screen.</p>
      </section>

      <section className="catalog" aria-label="Product catalog">
        <div className="toolbar">
          <label className="search-field">
            <Search size={19} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
            />
            {isFetching && !isLoading && <span className="mini-spinner" />}
          </label>

          <div className="toolbar-actions">
            <label className="sort-field">
              <SlidersHorizontal size={17} aria-hidden="true" />
              <select onChange={(event) => updateSort(event.target.value)} aria-label="Sort products">
                {sortOptions.map((option, index) => <option value={index} key={option.label}>{option.label}</option>)}
              </select>
            </label>
            <button
              className="export-button"
              onClick={() => data?.products && exportProducts(data.products)}
              disabled={!data?.products.length}
            >
              <Download size={17} /> Export Excel
            </button>
          </div>
        </div>

        {isLoading ? (
          <LoadingRows />
        ) : error ? (
          <div className="message-state" role="alert">
            <div className="message-icon error-icon">!</div>
            <h2>We couldn’t load the catalog</h2>
            <p>{error.message}</p>
            <button onClick={() => refetch()}><RefreshCw size={16} /> Try again</button>
          </div>
        ) : data?.products.length === 0 ? (
          <div className="message-state">
            <div className="message-icon"><PackageOpen size={26} /></div>
            <h2>No products found</h2>
            <p>Try a different search phrase or clear your search.</p>
            <button onClick={() => setSearch("")}>Clear search</button>
          </div>
        ) : (
          <div className={`product-grid ${isFetching ? "is-refreshing" : ""}`}>
            {data?.products.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <Image src={product.thumbnail} alt="" fill sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 25vw" />
                  <span className="category">{product.category.replaceAll("-", " ")}</span>
                </div>
                <div className="card-content">
                  <div className="product-meta">
                    <span>{product.brand ?? "Independent"}</span>
                    <span className="rating"><Star size={13} fill="currentColor" /> {product.rating.toFixed(1)}</span>
                  </div>
                  <h2>{product.title}</h2>
                  <p>{product.description}</p>
                  <div className="card-footer">
                    <strong>${product.price.toFixed(2)}</strong>
                    <span className={product.stock < 10 ? "low-stock" : ""}>{product.stock} in stock</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!error && data && data.total > 0 && (
          <div className="pagination-bar">
            <div className="result-count">Showing <b>{start}–{end}</b> of <b>{data.total}</b></div>
            <div className="pagination">
              <button disabled={query.page === 1} onClick={() => setQuery((current) => ({ ...current, page: current.page - 1 }))}>Previous</button>
              <span>Page <b>{query.page}</b> of {pageCount}</span>
              <button disabled={query.page >= pageCount} onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))}>Next</button>
            </div>
            <label className="page-size">
              Show
              <select
                value={query.limit}
                onChange={(event) => setQuery((current) => ({ ...current, page: 1, limit: Number(event.target.value) }))}
              >
                {[8, 12, 20, 40].map((size) => <option key={size}>{size}</option>)}
              </select>
            </label>
          </div>
        )}
      </section>

      <footer>Powered by DummyJSON <span>•</span> Built with TanStack Query</footer>
    </main>
  );
}
