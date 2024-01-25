export interface Product {
  id: string;
  handle: string;
}

export interface ProductsResponse {
  products: Product[];
  endCursor?: string;
  hasNextPage?: boolean;
}