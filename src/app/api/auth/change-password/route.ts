import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "UPDATE",
        entityType: "USER",
        entityId: user.id,
        organizationId: session.organizationId,
      },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
