import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getSession } from "@/lib/session";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const filename = `${randomUUID()}-${file.name.replace(/\s+/g, "_")}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "receipts");
    
    // Ensure directory exists (though we created it, safe to check)
    await mkdir(uploadDir, { recursive: true });
    
    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    const url = `/uploads/receipts/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
