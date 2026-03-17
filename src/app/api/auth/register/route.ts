import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password, organizationName } = await req.json();

    if (!name || !email || !password || (!organizationName && !(await prisma.partner.findFirst({ where: { email } })))) {
      return NextResponse.json(
        { error: "Missing required fields (Name, Email, Password, or Organization Name)" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Check for partner invitation
    const invitedPartner = await prisma.partner.findFirst({
        where: { email },
        orderBy: { createdAt: 'desc' }
    });

    let organizationId: string;
    let role: "ADMIN" | "PARTNER" = "ADMIN";

    if (invitedPartner) {
        organizationId = invitedPartner.organizationId;
        role = "PARTNER";
    } else {
        const organization = await prisma.organization.create({
            data: {
                name: organizationName,
                currency: "USD",
            },
        });
        organizationId = organization.id;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        organizationId,
      },
    });

    const userOrg = await prisma.organization.findUnique({
        where: { id: organizationId }
    });

    if (!userOrg) throw new Error("Org not found");

    const result = { user, organization: userOrg };

    const token = await signToken({
      userId: result.user.id,
      organizationId: result.organization.id,
      role: result.user.role,
    });

    const response = NextResponse.json(
        { message: "Registration successful" },
        { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
