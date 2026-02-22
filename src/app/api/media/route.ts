import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "media";

/** GET — list all files in the workspace's folder */
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: member } = await supabase
            .from("workspace_members")
            .select("workspace_id")
            .eq("user_id", user.id)
            .single();

        if (!member) {
            return NextResponse.json({ files: [] });
        }

        const folder = member.workspace_id;
        const { data: files, error } = await supabase.storage
            .from(BUCKET)
            .list(folder, { sortBy: { column: "created_at", order: "desc" } });

        if (error) {
            console.error("Storage list error:", error);
            return NextResponse.json({ files: [] });
        }

        // Build public URLs + metadata
        const items = (files ?? [])
            .filter((f) => f.name !== ".emptyFolderPlaceholder")
            .map((f) => {
                const path = `${folder}/${f.name}`;
                const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
                const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
                const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"];
                const videoExts = ["mp4", "mov", "avi", "webm", "mkv"];
                let type: "image" | "video" | "document" = "document";
                if (imageExts.includes(ext)) type = "image";
                else if (videoExts.includes(ext)) type = "video";

                return {
                    id: f.id ?? f.name,
                    name: f.name,
                    url: urlData?.publicUrl ?? "",
                    type,
                    size: (f.metadata as Record<string, unknown>)?.size ?? 0,
                    created_at: f.created_at ?? new Date().toISOString(),
                };
            });

        return NextResponse.json({ files: items });
    } catch (err) {
        console.error("Media GET error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/** POST — upload files (multipart/form-data) */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: member } = await supabase
            .from("workspace_members")
            .select("workspace_id")
            .eq("user_id", user.id)
            .single();

        if (!member) {
            return NextResponse.json({ error: "No workspace" }, { status: 404 });
        }

        const formData = await req.formData();
        const files = formData.getAll("files") as File[];

        if (!files.length) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
        }

        const results = [];

        for (const file of files) {
            const ext = file.name.split(".").pop() ?? "";
            const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
            const path = `${member.workspace_id}/${safeName}`;

            const buffer = Buffer.from(await file.arrayBuffer());

            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(path, buffer, {
                    contentType: file.type || "application/octet-stream",
                    upsert: false,
                });

            if (uploadError) {
                console.error(`Upload error for ${file.name}:`, uploadError);
                results.push({ name: file.name, error: uploadError.message });
                continue;
            }

            const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

            const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"];
            const videoExts = ["mp4", "mov", "avi", "webm", "mkv"];
            let type: "image" | "video" | "document" = "document";
            if (imageExts.includes(ext.toLowerCase())) type = "image";
            else if (videoExts.includes(ext.toLowerCase())) type = "video";

            results.push({
                id: safeName,
                name: file.name,
                storageName: safeName,
                url: urlData?.publicUrl ?? "",
                type,
                size: file.size,
                created_at: new Date().toISOString(),
            });
        }

        return NextResponse.json({ files: results }, { status: 201 });
    } catch (err) {
        console.error("Media POST error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/** DELETE — remove files by name */
export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: member } = await supabase
            .from("workspace_members")
            .select("workspace_id")
            .eq("user_id", user.id)
            .single();

        if (!member) {
            return NextResponse.json({ error: "No workspace" }, { status: 404 });
        }

        const body = await req.json();
        const fileNames: string[] = body.fileNames ?? [];

        if (!fileNames.length) {
            return NextResponse.json({ error: "No files specified" }, { status: 400 });
        }

        const paths = fileNames.map((name) => `${member.workspace_id}/${name}`);
        const { error } = await supabase.storage.from(BUCKET).remove(paths);

        if (error) {
            console.error("Storage delete error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ deleted: fileNames.length });
    } catch (err) {
        console.error("Media DELETE error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
