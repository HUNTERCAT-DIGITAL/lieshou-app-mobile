/**
 * Mobile inventory service —— 进销存（商品 / 出入库 / 库存预警）.
 *
 * 2026-09 上收 lieshou-core-web（业务逻辑唯一源，同 approval/customer/lead 模式）：
 * 实现移至 core-web features/inventory/inventory.api.ts + inventory.ts（纯函数），
 * 本文件保留导出路径兼容既有页面/测试（import '../../services/inventory' 不变）。
 * 命名对齐 core-web：stockIn/stockOut 收 body（StockChangeRequest）；
 * 库存预警判定 stockLevel(qty, lowThreshold) 业务规则来自 core-web 纯函数。
 */
export {
  listProducts,
  countProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  stockIn,
  stockOut,
  listMovements,
} from "@lieshoucloud/core-web";
export type {
  CreateProductRequest,
  Product,
  StockChangeRequest,
  StockMovement,
  StockMovementType,
  UpdateProductRequest,
} from "@lieshoucloud/contract-types";
export { MOVEMENT_META } from "@lieshoucloud/contract-types";
export { LOW_STOCK_THRESHOLD, stockLevel } from "@lieshoucloud/core-web";
export type { StockLevel } from "@lieshoucloud/core-web";
