"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { SaveIcon } from "lucide-react"
import { toast } from "sonner"

import { updateSettingsAction, type SettingsFormState } from "@/app/admin/settings/actions"
import type { SettingsMap } from "@/lib/settings"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState: SettingsFormState = {
  ok: false,
}

const colorOptions = [
  { value: "red", label: "Red", className: "bg-red-500" },
  { value: "orange", label: "Orange", className: "bg-orange-500" },
  { value: "amber", label: "Amber", className: "bg-amber-500" },
  { value: "emerald", label: "Emerald", className: "bg-emerald-500" },
  { value: "cyan", label: "Cyan", className: "bg-cyan-500" },
  { value: "blue", label: "Blue", className: "bg-blue-500" },
  { value: "violet", label: "Violet", className: "bg-violet-500" },
  { value: "rose", label: "Rose", className: "bg-rose-500" },
  { value: "neutral", label: "Neutral", className: "bg-neutral-500" },
]

function TextInput({
  label,
  name,
  defaultValue,
  error,
  placeholder,
  required,
  type = "text",
}: {
  label: string
  name: string
  defaultValue?: string
  error?: string
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={name} required={required}>{label}</FieldLabel>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}

function UploadableUrlInput({
  label,
  name,
  defaultValue,
  purpose,
  error,
}: {
  label: string
  name: string
  defaultValue?: string
  purpose: "logo"
  error?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultValue ?? "")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function upload(file: File) {
    setUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("purpose", purpose)
    formData.append("altText", label)

    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        setUploadError(data.error ?? "Không thể tải ảnh lên.")
        return
      }

      setValue(data.url)
    } catch {
      setUploadError("Không thể tải ảnh lên. Vui lòng thử lại.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Field data-invalid={Boolean(error || uploadError)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <div className="flex gap-2">
        <Input
          id={name}
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={Boolean(error || uploadError)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void upload(file)
            event.target.value = ""
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Đang tải..." : "Tải lên"}
        </Button>
      </div>
      {value ? (
        <div className="mt-2 flex items-center gap-3 rounded-lg border bg-muted/30 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="size-10 rounded-md border bg-background object-contain p-1" />
          <span className="text-xs text-muted-foreground">
            Logo upload sẽ được resize tối đa 512x512, tối đa 1MB.
          </span>
        </div>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
      {uploadError ? <FieldError>{uploadError}</FieldError> : null}
    </Field>
  )
}

function TextArea({
  label,
  name,
  defaultValue,
  error,
  placeholder,
  required,
  rows = 3,
}: {
  label: string
  name: string
  defaultValue?: string
  error?: string
  placeholder?: string
  required?: boolean
  rows?: number
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={name} required={required}>{label}</FieldLabel>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30"
        )}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}

function ToggleField({
  label,
  name,
  defaultChecked,
  description,
}: {
  label: string
  name: string
  defaultChecked?: boolean
  description?: string
}) {
  return (
    <Field orientation="horizontal" className="items-start rounded-lg border p-3">
      <Input
        id={name}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4"
      />
      <div className="grid gap-1">
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
      </div>
    </Field>
  )
}

function SelectField({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string
  name: string
  defaultValue?: string
  children: React.ReactNode
}) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {children}
      </select>
    </Field>
  )
}

function ColorSelect({
  label,
  name,
  defaultValue,
}: {
  label: string
  name: string
  defaultValue?: string
}) {
  return (
    <SelectField label={label} name={name} defaultValue={defaultValue}>
      {colorOptions.map((color) => (
        <option key={color.value} value={color.value}>
          {color.label}
        </option>
      ))}
    </SelectField>
  )
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <FieldGroup>{children}</FieldGroup>
      </CardContent>
    </Card>
  )
}

export function SettingsForm({ settings }: { settings: SettingsMap }) {
  const [state, formAction, isPending] = useActionState(
    updateSettingsAction,
    initialState
  )

  useEffect(() => {
    if (!state.message) {
      return
    }

    if (state.ok) {
      toast.success(state.message)
    } else {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-6">
      <SettingsSection
        title="Tổng quan"
        description="Thông tin nhận diện cơ bản của website."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Tên website"
            name="siteName"
            defaultValue={settings.general.siteName}
            error={state.errors?.siteName}
            required
          />
          <TextInput
            label="URL website"
            name="siteUrl"
            defaultValue={settings.general.siteUrl}
            error={state.errors?.siteUrl}
            placeholder="https://tekvora.com"
            required
            type="url"
          />
          <TextInput
            label="Tagline"
            name="tagline"
            defaultValue={settings.general.tagline}
          />
          <TextInput
            label="Ngôn ngữ mặc định"
            name="defaultLocale"
            defaultValue={settings.general.defaultLocale}
          />
          <UploadableUrlInput
            label="Logo URL"
            name="logoUrl"
            defaultValue={settings.general.logoUrl}
            purpose="logo"
          />
          <TextInput
            label="Favicon URL"
            name="faviconUrl"
            defaultValue={settings.general.faviconUrl}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="SEO"
        description="Metadata mặc định dùng khi nội dung chưa có SEO riêng."
      >
        <TextInput
          label="Tiêu đề SEO mặc định"
          name="defaultSeoTitle"
          defaultValue={settings.seo.defaultSeoTitle}
          error={state.errors?.defaultSeoTitle}
          required
        />
        <TextArea
          label="Mô tả SEO mặc định"
          name="defaultSeoDescription"
          defaultValue={settings.seo.defaultSeoDescription}
          error={state.errors?.defaultSeoDescription}
          required
          rows={3}
        />
        <TextInput
          label="Ảnh OG mặc định"
          name="defaultOgImage"
          defaultValue={settings.seo.defaultOgImage}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <ToggleField
            label="Cho phép index"
            name="robotsIndex"
            defaultChecked={settings.seo.robotsIndex}
          />
          <ToggleField
            label="Cho phép follow"
            name="robotsFollow"
            defaultChecked={settings.seo.robotsFollow}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Mạng xã hội">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Twitter/X" name="twitterUrl" defaultValue={settings.social.twitterUrl} />
          <TextInput label="Facebook" name="facebookUrl" defaultValue={settings.social.facebookUrl} />
          <TextInput label="LinkedIn" name="linkedinUrl" defaultValue={settings.social.linkedinUrl} />
          <TextInput label="GitHub" name="githubUrl" defaultValue={settings.social.githubUrl} />
          <TextInput label="YouTube" name="youtubeUrl" defaultValue={settings.social.youtubeUrl} />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Quảng cáo"
        description="Lưu cấu hình vị trí quảng cáo để dùng cho layout nội dung sau này."
      >
        <ToggleField
          label="Bật quảng cáo"
          name="enableAds"
          defaultChecked={settings.ads.enableAds}
        />
        <TextInput
          label="AdSense Publisher ID"
          name="adsensePublisherId"
          defaultValue={settings.ads.adsensePublisherId}
          placeholder="pub-xxxxxxxxxxxxxxxx"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <TextArea label="Article top ad" name="articleTopAd" defaultValue={settings.ads.articleTopAd} />
          <TextArea label="Article middle ad" name="articleMiddleAd" defaultValue={settings.ads.articleMiddleAd} />
          <TextArea label="Sidebar ad" name="sidebarAd" defaultValue={settings.ads.sidebarAd} />
          <TextArea label="Mobile sticky ad" name="mobileStickyAd" defaultValue={settings.ads.mobileStickyAd} />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Media"
        description="Cấu hình upload, tối ưu ảnh, thumbnail và avatar."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <TextInput
            label="Dung lượng upload tối đa (MB)"
            name="maxUploadSizeMB"
            type="number"
            defaultValue={String(settings.media.maxUploadSizeMB)}
            error={state.errors?.maxUploadSizeMB}
          />
          <TextInput
            label="Chất lượng ảnh"
            name="imageQuality"
            type="number"
            defaultValue={String(settings.media.imageQuality)}
            error={state.errors?.imageQuality}
          />
          <TextInput
            label="MIME type cho phép"
            name="allowedImageTypes"
            defaultValue={settings.media.allowedImageTypes.join(", ")}
            error={state.errors?.allowedImageTypes}
          />
          <TextInput
            label="Chiều rộng ảnh tối đa"
            name="maxImageWidth"
            type="number"
            defaultValue={String(settings.media.maxImageWidth)}
            error={state.errors?.maxImageWidth}
          />
          <TextInput
            label="Chiều cao ảnh tối đa"
            name="maxImageHeight"
            type="number"
            defaultValue={String(settings.media.maxImageHeight)}
            error={state.errors?.maxImageHeight}
          />
          <ToggleField
            label="Chuyển JPG/PNG sang WebP"
            name="convertToWebp"
            defaultChecked={settings.media.convertToWebp}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <ToggleField
            label="Tạo thumbnail"
            name="generateThumbnail"
            defaultChecked={settings.media.generateThumbnail}
          />
          <TextInput
            label="Thumbnail width"
            name="thumbnailWidth"
            type="number"
            defaultValue={String(settings.media.thumbnailWidth)}
          />
          <TextInput
            label="Thumbnail height"
            name="thumbnailHeight"
            type="number"
            defaultValue={String(settings.media.thumbnailHeight)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <TextInput
            label="Avatar tối đa (MB)"
            name="avatarMaxSizeMB"
            type="number"
            defaultValue={String(settings.media.avatarMaxSizeMB)}
            error={state.errors?.avatarMaxSizeMB}
          />
          <TextInput
            label="Avatar width"
            name="avatarWidth"
            type="number"
            defaultValue={String(settings.media.avatarWidth)}
            error={state.errors?.avatarWidth}
          />
          <TextInput
            label="Avatar height"
            name="avatarHeight"
            type="number"
            defaultValue={String(settings.media.avatarHeight)}
            error={state.errors?.avatarHeight}
          />
          <TextInput
            label="Avatar quality"
            name="avatarQuality"
            type="number"
            defaultValue={String(settings.media.avatarQuality)}
            error={state.errors?.avatarQuality}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Giao diện">
        <div className="grid gap-4 md:grid-cols-3">
          <ColorSelect
            label="Màu chính"
            name="primaryColor"
            defaultValue={settings.theme.primaryColor}
          />
          <ColorSelect
            label="Màu nhấn"
            name="accentColor"
            defaultValue={settings.theme.accentColor}
          />
          <SelectField
            label="Theme mặc định"
            name="defaultTheme"
            defaultValue={settings.theme.defaultTheme}
          >
            <option value="system">Theo hệ thống</option>
            <option value="light">Sáng</option>
            <option value="dark">Tối</option>
          </SelectField>
        </div>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <span
              key={color.value}
              className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs text-muted-foreground"
            >
              <span className={cn("size-3 rounded-full", color.className)} />
              {color.label}
            </span>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Footer">
        <TextArea
          label="Mô tả footer"
          name="footerDescription"
          defaultValue={settings.footer.footerDescription}
        />
        <TextInput
          label="Copyright"
          name="copyrightText"
          defaultValue={settings.footer.copyrightText}
        />
      </SettingsSection>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button type="submit" size="lg" disabled={isPending}>
          <SaveIcon />
          {isPending ? "Đang lưu..." : "Lưu cài đặt"}
        </Button>
      </div>
    </form>
  )
}
