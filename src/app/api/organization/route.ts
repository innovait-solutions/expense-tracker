import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, currency } = body;

    const updatedOrg = await prisma.organization.update({
      where: { id: session.organizationId },
      data: {
        name,
        currency,
      },
    });

    return NextResponse.json(updatedOrg);
  } catch (error) {
    console.error("Failed to update organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
    });

    return NextResponse.json(org);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}
