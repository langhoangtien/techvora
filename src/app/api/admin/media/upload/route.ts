import { NextResponse } from "next/server"

import { isAdminSession } from "@/lib/admin-auth"
import {
  processAndStoreImage,
  type MediaUploadPurpose,
} from "@/modules/media/upload"

export const runtime = "nodejs"

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json(
      { error: "Bạn không có quyền tải ảnh lên." },
      { status: 403 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const altText = String(formData.get("altText") ?? "").trim()
    const rawPurpose = String(formData.get("purpose") ?? "content").trim()
    const purpose: MediaUploadPurpose = rawPurpose === "logo" ? "logo" : "content"

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Vui lòng chọn một file ảnh." },
        { status: 400 }
      )
    }

    const media = await processAndStoreImage(file, altText, purpose)

    return NextResponse.json({
      id: media.id,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl,
      altText: media.altText,
      width: media.width,
      height: media.height,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể tải ảnh lên. Vui lòng thử lại.",
      },
      { status: 400 }
    )
  }
}
