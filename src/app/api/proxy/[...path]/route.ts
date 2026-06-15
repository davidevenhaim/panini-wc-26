"use server";
import { CONFIG } from "@/lib/app-config";

import { NextRequest, NextResponse } from "next/server";

const SERVER_URL = CONFIG.serverUrl;

type RouteParams = { params: Promise<{ path: string[] }> };

async function handleProxy(req: NextRequest, pathParam: { path: string[] }) {
  const pathArray = Array.isArray(pathParam.path) ? pathParam.path : [];

  if (!pathArray.length) {
    return NextResponse.json({ message: "Invalid request: No path provided" }, { status: 400 });
  }

  const endpoint = pathArray.join("/");
  const queryString = new URL(req.url).search;
  const apiUrl = `${SERVER_URL}/${endpoint}${queryString}`;

  const contentType = req.headers.get("content-type") ?? "";
  let body: string | ArrayBuffer | undefined;

  if (req.method !== "GET" && req.method !== "HEAD") {
    if (contentType.includes("multipart/form-data")) {
      body = await req.arrayBuffer();
    } else {
      try {
        body = JSON.stringify(await req.json());
      } catch {
        // body stays undefined for non-JSON requests
      }
    }
  }

  try {
    const newHeaders = new Headers();

    // Forward all headers except host
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "host") newHeaders.set(key, value);
    });

    if (!contentType.includes("multipart/form-data")) {
      newHeaders.set("Content-Type", "application/json");
      newHeaders.delete("content-length");
    }

    const response = await fetch(apiUrl, {
      method: req.method ?? "GET",
      headers: newHeaders,
      body,
      signal: AbortSignal.timeout(15_000),
    });

    const responseContentType = response.headers.get("content-type");
    const responseData = responseContentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    const nextResp = NextResponse.json(responseData, { status: response.status });

    const setCookieValue = response.headers.get("set-cookie");
    if (setCookieValue) nextResp.headers.set("Set-Cookie", setCookieValue);

    return nextResp;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Proxy error for ${req.method} /${endpoint}: ${message}`);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  return handleProxy(req, await params);
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  return handleProxy(req, await params);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  return handleProxy(req, await params);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  return handleProxy(req, await params);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  return handleProxy(req, await params);
}
