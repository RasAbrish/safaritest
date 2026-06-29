export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
};

export type ProductsResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

export type ProductQuery = {
  page: number;
  limit: number;
  search: string;
  sortBy: "title" | "price" | "rating" | "stock";
  order: "asc" | "desc";
};
