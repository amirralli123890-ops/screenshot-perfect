import { queryOptions } from "@tanstack/react-query";
import { getFeed } from "./publication.functions";
export const feedOptions = (category?: string, page = 1, q = "") =>
  queryOptions({
    queryKey: ["feed", category ?? "all", page, q],
    queryFn: () => getFeed({ data: { category, page, q } }),
    staleTime: 30000,
  });
