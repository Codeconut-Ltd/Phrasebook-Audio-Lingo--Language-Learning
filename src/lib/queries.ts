import { queryOptions } from "@tanstack/react-query";
import { getProfile, getStats, listPhrases, type ListParams } from "./phrases.functions";

export const profileQuery = queryOptions({ queryKey: ["profile"], queryFn: () => getProfile() });
export const statsQuery = queryOptions({ queryKey: ["stats"], queryFn: () => getStats() });
export const libraryQuery = (params: ListParams) =>
  queryOptions({ queryKey: ["library", params], queryFn: () => listPhrases({ data: params }) });
