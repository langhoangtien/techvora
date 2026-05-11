import { LoginForm } from "@/components/login-form"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function Page() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/admin")
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
