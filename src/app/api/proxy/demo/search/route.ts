import { NextRequest, NextResponse } from "next/server";

import { DEMO_SEARCH_ITEMS, type DemoSearchApiResponse } from "@/components/demo/data";

const MIN_QUERY_LENGTH = 2;
const SIMULATED_DELAY_MS = 1000;

export async function GET(req: NextRequest): Promise<NextResponse<DemoSearchApiResponse>> {
  const query = new URL(req.url).searchParams.get("q")?.trim().toLowerCase() ?? "";

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ items: [] });
  }

  const items = DEMO_SEARCH_ITEMS.filter((item) => item.searchText.includes(query)).map(
    ({ id, labelKey, categoryKey }) => ({ id, labelKey, categoryKey })
  );

  return NextResponse.json({ items });
}
