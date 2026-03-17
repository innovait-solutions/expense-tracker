import prisma from "./prisma";

export async function logActivity({
  userId,
  organizationId,
  action,
  entityType,
  entityId,
}: {
  userId: string;
  organizationId: string;
  action: string;
  entityType: string;
  entityId: string;
}) {
  try {
    return await prisma.activityLog.create({
      data: {
        userId,
        organizationId,
        action,
        entityType,
        entityId,
      },
    });
  } catch (error) {
    console.error("Activity logging failed:", error);
  }
}
