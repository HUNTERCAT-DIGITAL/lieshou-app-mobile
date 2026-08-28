/**
 * Mobile inventory service（Phase 9 · 多端接入）.
 */
import { request } from "@lieshoucloud/contract-api";

export type StockMovementType = "IN" | "OUT";

export interface Product {
  id: number;
  tenantId: number;
  name: string;
  code?: string | null;
  unit?: string | null;
  price?: number | null;
  stockQuantity: number;
  remark?: string | null;
  createdAt: string;
}

export interface StockMovement {
  id: number;
  productId: number;
  type: StockMovementType;
  quantity: number;
  remark?: string | null;
  createdAt: string;
}

export async function listProducts(keyword?: string): Promise<Product[]> {
  const query: Record<string, string> = {};
  if (keyword) query.keyword = keyword;
  return request<Product[]>({ method: "GET", path: `/api/products`, query });
}

export async function createProduct(body: {
  name: string;
  code?: string;
  unit?: string;
  price?: number;
  remark?: string;
}): Promise<Product> {
  return request<Product>({ method: "POST", path: `/api/products`, body });
}

export async function stockIn(id: number, quantity: number, remark?: string): Promise<Product> {
  return request<Product>({ method: "POST", path: `/api/products/${id}/stock-in`, body: { quantity, remark } });
}

export async function stockOut(id: number, quantity: number, remark?: string): Promise<Product> {
  return request<Product>({ method: "POST", path: `/api/products/${id}/stock-out`, body: { quantity, remark } });
}

export const MOVEMENT_META: Record<StockMovementType, { text: string; color: string }> = {
  IN: { text: "入库", color: "#52c41a" },
  OUT: { text: "出库", color: "#fa8c16" },
};
