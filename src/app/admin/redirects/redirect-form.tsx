"use client"

import { useActionState } from "react"
import type { Redirect } from "@/generated/prisma/client"

import {
  saveRedirectAction,
  type RedirectFormState,
} from "@/modules/redirects/actions"
import { cn } from "@/lib/utils"
import { SubmitButton } from "@/components/admin/submit-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState: RedirectFormState = { ok: false }

export function RedirectForm({ redirect }: { redirect?: Redirect | null }) {
  const [state, formAction] = useActionState(saveRedirectAction, initialState)

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <input type="hidden" name="id" value={redirect?.id ?? ""} />
      {state.message ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            state.ok
              ? "bg-emerald-50 text-emerald-700"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {state.message}
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin redirect</CardTitle>
          <CardDescription>
            Tạo chuyển hướng public bằng đường dẫn nội bộ hoặc URL ngoài dùng
            HTTPS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(state.errors?.fromPath)}>
              <FieldLabel htmlFor="fromPath" required>
                Đường dẫn nguồn
              </FieldLabel>
              <Input
                id="fromPath"
                name="fromPath"
                defaultValue={redirect?.source ?? ""}
                placeholder="/old-path"
                required
              />
              {state.errors?.fromPath ? (
                <FieldError>{state.errors.fromPath}</FieldError>
              ) : null}
            </Field>
            <Field data-invalid={Boolean(state.errors?.toPath)}>
              <FieldLabel htmlFor="toPath" required>
                Đường dẫn đích
              </FieldLabel>
              <Input
                id="toPath"
                name="toPath"
                defaultValue={redirect?.destination ?? ""}
                placeholder="/new-path hoặc https://example.com"
                required
              />
              {state.errors?.toPath ? (
                <FieldError>{state.errors.toPath}</FieldError>
              ) : null}
            </Field>
            <Field data-invalid={Boolean(state.errors?.status)}>
              <FieldLabel htmlFor="status" required>
                Mã trạng thái
              </FieldLabel>
              <select
                id="status"
                name="status"
                defaultValue={redirect?.statusCode ?? 301}
                className="h-9 rounded-lg border bg-background px-3 text-sm"
              >
                <option value="301">301 - Chuyển hướng vĩnh viễn</option>
                <option value="302">302 - Chuyển hướng tạm thời</option>
              </select>
              {state.errors?.status ? (
                <FieldError>{state.errors.status}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" asChild>
          <a href="/admin/redirects">Hủy</a>
        </Button>
        <SubmitButton>{redirect ? "Lưu redirect" : "Tạo redirect"}</SubmitButton>
      </div>
    </form>
  )
}
