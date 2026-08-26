/**
 * Mobile legal service 单测（ADR-0036/0045）.
 *
 * 注意：mobile 用 jest.spyOn 命名空间对象（不能 jest.mock —— moduleNameMapper 映射后 mock 不生效，
 * 见 customer.test.ts 头部说明）。
 */
import * as apiClient from "@lieshoucloud/api-client";

import { getCase, listCaseEvents, listCases } from "./legal";

const mockRequest = jest.spyOn(apiClient, "request");

beforeEach(() => {
  mockRequest.mockReset();
  mockRequest.mockResolvedValue(undefined as never);
});

describe("mobile legal service", () => {
  it("listCases 无参数 → GET /legal/cases 默认分页 page=1 size=20", async () => {
    mockRequest.mockResolvedValue({ items: [], total: 0, page: 1, size: 20 });
    await listCases();
    expect(mockRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/legal/cases",
      query: { page: "1", size: "20" },
    });
  });

  it("listCases 带过滤 → query 只含非空项", async () => {
    mockRequest.mockResolvedValue({ items: [], total: 0, page: 1, size: 20 });
    await listCases({ keyword: "赵某", status: "IN_TRIAL" }, 2, 10);
    expect(mockRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/legal/cases",
      query: { page: "2", size: "10", keyword: "赵某", status: "IN_TRIAL" },
    });
  });

  it("getCase / listCaseEvents → GET 对应 path", async () => {
    mockRequest.mockResolvedValue({ id: 1 });
    await getCase(1);
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/legal/cases/1" });

    mockRequest.mockResolvedValue([]);
    await listCaseEvents(1);
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/legal/cases/1/events" });
  });
});
