import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const logo = formData.get("logo") as File;
        const sessionId = formData.get("sessionId") as string;

        if (!logo || !sessionId) {
            return NextResponse.json({ error: "Missing logo file or session ID" }, { status: 400 });
        }

        // Create directory for logos if it doesn't exist
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "logos");
        await fs.mkdir(uploadsDir, { recursive: true });

        // Save the logo with a filename based on the session ID
        const fileExtension = logo.name.split(".").pop() || "png";
        const fileName = `${sessionId}.${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        // Convert file to buffer and save
        const arrayBuffer = await logo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filePath, buffer);

        // Return success response with the public URL to the logo
        return NextResponse.json({
            success: true,
            logoUrl: `/uploads/logos/${fileName}`
        });
    } catch (error: any) {
        console.error("Error uploading logo:", error);
        return NextResponse.json(
            { error: error.message || "Failed to upload logo" },
            { status: 500 }
        );
    }
}