import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateXlsx } from "@/components/export/ExcelGenerator";
import type { FinanceiroData } from "@/types/plan";
import { defaultFinanceiroData } from "@/types/plan";

type RouteContext = { params: Promise<{ planId: string }> };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeParse(value: any) {
  if (value && typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { planId } = await context.params;

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: {
        financeiro: true,
        projectNickname: true,
        projectName: true,
        executionStartDate: true,
        executionEndDate: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const financeiro: FinanceiroData =
      (safeParse(plan.financeiro) as FinanceiroData | null) ?? {
        ...defaultFinanceiroData,
      };

    // Calculate project months for RH total computation
    let projectMonths = 0;
    if (plan.executionStartDate && plan.executionEndDate) {
      const start = new Date(plan.executionStartDate);
      const end = new Date(plan.executionEndDate);
      projectMonths = Math.max(
        (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()),
        0
      );
    }

    const buffer = await generateXlsx(financeiro, projectMonths);

    const nickname = plan.projectNickname || plan.projectName || "plano";
    const safeFilename = nickname
      .replace(/[^a-zA-Z0-9_\-\u00C0-\u024F ]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
      .slice(0, 60);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="financeiro-${safeFilename}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export/[planId]/xlsx error:", error);
    return NextResponse.json(
      { error: "Failed to generate XLSX" },
      { status: 500 }
    );
  }
}
