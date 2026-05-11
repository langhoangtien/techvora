import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { processAndStoreAvatar } from "@/modules/media/upload"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== "ADMIN" || !session.user.id) {
    return NextResponse.json(
      { error: "Bạn không có quyền tải avatar lên." },
      { status: 403 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const altText = String(formData.get("altText") ?? "").trim()

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Vui lòng chọn một file ảnh." },
        { status: 400 }
      )
    }

    const media = await processAndStoreAvatar(file, altText)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        avatarUrl: media.url,
        image: media.url,
      },
    })

    return NextResponse.json({
      id: media.id,
      url: media.url,
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
            : "Không thể tải avatar lên. Vui lòng thử lại.",
      },
      { status: 400 }
    )
  }
}
