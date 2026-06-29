import type { Product } from "@/types/product";

export async function exportProducts(products: Product[]) {
  const XLSX = await import("xlsx");
  const rows = products.map((product) => ({
    ID: product.id,
    Product: product.title,
    Brand: product.brand ?? "—",
    Category: product.category,
    Price: product.price,
    Rating: product.rating,
    Stock: product.stock
  }));
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 8 },
    { wch: 34 },
    { wch: 20 },
    { wch: 22 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 }
  ];
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  XLSX.writeFile(workbook, `products-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
