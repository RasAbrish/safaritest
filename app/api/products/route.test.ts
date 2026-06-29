import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

function request(query = "") {
  return new NextRequest(`http://localhost/api/products${query}`);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/products", () => {
  it("rejects a zero limit", async () => {
    const response = await GET(request("?limit=0&skip=5"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Limit must be an integer between 1 and 50"
    });
  });

  it("rejects negative skip values", async () => {
    const response = await GET(request("?limit=5&skip=-1"));
    expect(response.status).toBe(400);
  });

  it("rejects unsupported sort values", async () => {
    expect((await GET(request("?sortBy=unknown"))).status).toBe(400);
    expect((await GET(request("?order=sideways"))).status).toBe(400);
  });

  it("uses defaults and ignores unsupported parameters", async () => {
    const upstream = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ products: [], total: 0, skip: 0, limit: 10 }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );
    const response = await GET(request("?unused=value"));
    expect(response.status).toBe(200);
    expect(upstream).toHaveBeenCalledWith(
      "https://dummyjson.com/products?limit=10&skip=0&sortBy=title&order=asc",
      expect.any(Object)
    );
  });

  it("escapes search text and returns the total header", async () => {
    const upstream = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ products: [], total: 3, skip: 0, limit: 5 }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );
    const response = await GET(request("?limit=5&q=phone%20%26%20tablet"));
    expect(response.headers.get("X-Total-Count")).toBe("3");
    expect(upstream).toHaveBeenCalledWith(
      "https://dummyjson.com/products/search?limit=5&skip=0&sortBy=title&order=asc&q=phone+%26+tablet",
      expect.any(Object)
    );
  });
});
