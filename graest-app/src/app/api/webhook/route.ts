import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const response = await fetch("http://pt-creator-webhook:9000/hooks/deploy", {
      method: "POST",
      headers: {
        "Content-Type": headers["content-type"] || "application/json",
        "X-Hub-Signature-256": headers["x-hub-signature-256"] || "",
        "X-GitHub-Event": headers["x-github-event"] || "",
        "X-GitHub-Delivery": headers["x-github-delivery"] || "",
      },
      body,
    });

    const text = await response.text();
    return new NextResponse(text, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "Webhook proxy failed" },
      { status: 502 }
    );
  }
}
