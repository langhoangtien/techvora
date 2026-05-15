"use client"

import { useActionState, useMemo, useRef, useState } from "react"
import Link from "next/link"
import type { Author, Category, Post, PostTag, Tag } from "@/generated/prisma/client"
import {
  IconCircleCheck as CheckCircle2Icon,
  IconAlertCircle as CircleAlertIcon,
  IconCircleX as CircleXIcon,
  IconExternalLink as ExternalLinkIcon,
} from "@tabler/icons-react"

import {
  createInlineTagAction,
  savePostAction,
  type PostFormState,
} from "@/modules/posts/actions"
import { calculateSeoScore } from "@/modules/posts/seo-checker"
import { slugify } from "@/lib/slugify"
import { TiptapEditor } from "@/components/editor/tiptap-editor"
import { SubmitButton } from "@/components/admin/submit-button"
import { AdminBadge } from "@/components/admin/badge"
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
import { cn } from "@/lib/utils"

type PostWithTags = Post & {
  tags: (PostTag & { tag: Tag })[]
}

type EditorOptions = {
  categories: Pick<Category, "id" | "name">[]
  tags: Pick<Tag, "id" | "name" | "slug">[]
  authors: Pick<Author, "id" | "name">[]
}

const initialState: PostFormState = { ok: false }

const statuses = [
  { value: "DRAFT", label: "NhÃ¡p" },
  { value: "PUBLISHED", label: "Xuáº¥t báº£n" },
  { value: "SCHEDULED", label: "LÃªn lá»‹ch" },
  { value: "ARCHIVED", label: "LÆ°u trá»¯" },
]

const postTypes = [
  { value: "ARTICLE", label: "Article" },
  { value: "TOOL", label: "Tool" },
  { value: "SAAS", label: "Services" },
  { value: "COMPARISON", label: "Comparison" },
  { value: "PAGE", label: "Page" },
]

export function PostForm({
  post,
  options,
  defaultSeoTitle,
  defaultSeoDescription,
}: {
  post?: PostWithTags | null
  options: EditorOptions
  defaultSeoTitle: string
  defaultSeoDescription: string
}) {
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [state, formAction] = useActionState(savePostAction, initialState)
  const [title, setTitle] = useState(post?.title ?? "")
  const [slug, setSlug] = useState(post?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug))
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "")
  const [content, setContent] = useState(post?.content ?? "")
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "")
  const [seoDescription, setSeoDescription] = useState(post?.seoDesc ?? "")
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "")
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonical ?? "")
  const [ogImageUrl, setOgImageUrl] = useState(post?.ogImageUrl ?? "")
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? "")
  const [tagOptions, setTagOptions] = useState(options.tags)
  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.tags.map((item) => item.tagId) ?? []
  )
  const [newTagName, setNewTagName] = useState("")
  const [tagMessage, setTagMessage] = useState<string | null>(null)
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null)

  const seo = useMemo(
    () =>
      calculateSeoScore({
        title,
        slug,
        excerpt,
        content,
        seoTitle: seoTitle || defaultSeoTitle,
        seoDescription: seoDescription || defaultSeoDescription,
        coverImageUrl,
        categoryId,
        tagIds: selectedTags,
      }),
    [
      title,
      slug,
      excerpt,
      content,
      seoTitle,
      seoDescription,
      defaultSeoTitle,
      defaultSeoDescription,
      coverImageUrl,
      categoryId,
      selectedTags,
    ]
  )

  async function createTag() {
    setTagMessage(null)
    const result = await createInlineTagAction(newTagName)

    if (!result.ok || !result.tag) {
      setTagMessage(result.message)
      return
    }

    setTagOptions((current) =>
      current.some((tag) => tag.id === result.tag.id)
        ? current
        : [...current, result.tag].sort((a, b) => a.name.localeCompare(b.name))
    )
    setSelectedTags((current) =>
      current.includes(result.tag.id) ? current : [...current, result.tag.id]
    )
    setNewTagName("")
    setTagMessage(result.message)
  }

  async function uploadCoverImage(file: File) {
    setCoverUploading(true)
    setCoverUploadError(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("altText", title || "Cover image")

    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        setCoverUploadError(data.error ?? "KhÃ´ng thá»ƒ táº£i áº£nh lÃªn.")
        return
      }

      setCoverImageUrl(data.url)
    } catch {
      setCoverUploadError("KhÃ´ng thá»ƒ táº£i áº£nh lÃªn. Vui lÃ²ng thá»­ láº¡i.")
    } finally {
      setCoverUploading(false)
    }
  }

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <input type="hidden" name="id" value={post?.id ?? ""} />
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="format" value="HTML" />
      {selectedTags.map((tagId) => (
        <input key={tagId} type="hidden" name="tagIds" value={tagId} />
      ))}
      <div className="space-y-6">
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
            <CardTitle>Ná»™i dung chÃ­nh</CardTitle>
            <CardDescription>
              TiÃªu Ä‘á», slug, excerpt vÃ  ná»™i dung rich text cá»§a bÃ i viáº¿t.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(state.errors?.title)}>
                <FieldLabel htmlFor="title" required>TiÃªu Ä‘á»</FieldLabel>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(event) => {
                    const next = event.target.value
                    setTitle(next)
                    if (!slugTouched) setSlug(slugify(next))
                  }}
                  aria-invalid={Boolean(state.errors?.title)}
                  required
                />
                {state.errors?.title ? <FieldError>{state.errors.title}</FieldError> : null}
              </Field>
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <Field data-invalid={Boolean(state.errors?.slug)}>
                  <FieldLabel htmlFor="slug" required>Slug</FieldLabel>
                  <Input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(event) => {
                      setSlugTouched(true)
                      setSlug(slugify(event.target.value))
                    }}
                    aria-invalid={Boolean(state.errors?.slug)}
                    required
                  />
                  {state.errors?.slug ? <FieldError>{state.errors.slug}</FieldError> : null}
                </Field>
                <Button
                  type="button"
                  variant="outline"
                  className="self-end"
                  onClick={() => {
                    setSlug(slugify(title))
                    setSlugTouched(true)
                  }}
                >
                  Táº¡o láº¡i slug
                </Button>
              </div>
              <Field>
                <FieldLabel htmlFor="excerpt">Excerpt</FieldLabel>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </Field>
              <Field data-invalid={Boolean(state.errors?.content)}>
                <FieldLabel required>Ná»™i dung</FieldLabel>
                <TiptapEditor value={content} onChange={setContent} />
                {state.errors?.content ? <FieldError>{state.errors.content}</FieldError> : null}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
            <CardDescription>
              Náº¿u bá» trá»‘ng, há»‡ thá»‘ng dÃ¹ng fallback tá»« Site Settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="seoTitle">SEO title</FieldLabel>
                <Input id="seoTitle" name="seoTitle" value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} placeholder={defaultSeoTitle} />
              </Field>
              <Field>
                <FieldLabel htmlFor="seoDescription">SEO description</FieldLabel>
                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  value={seoDescription}
                  onChange={(event) => setSeoDescription(event.target.value)}
                  placeholder={defaultSeoDescription}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field data-invalid={Boolean(state.errors?.canonicalUrl)}>
                  <FieldLabel htmlFor="canonicalUrl">Canonical URL</FieldLabel>
                  <Input id="canonicalUrl" name="canonicalUrl" value={canonicalUrl} onChange={(event) => setCanonicalUrl(event.target.value)} aria-invalid={Boolean(state.errors?.canonicalUrl)} />
                  {state.errors?.canonicalUrl ? <FieldError>{state.errors.canonicalUrl}</FieldError> : null}
                </Field>
                <Field data-invalid={Boolean(state.errors?.ogImageUrl)}>
                  <FieldLabel htmlFor="ogImageUrl">OG image URL</FieldLabel>
                  <Input id="ogImageUrl" name="ogImageUrl" value={ogImageUrl} onChange={(event) => setOgImageUrl(event.target.value)} aria-invalid={Boolean(state.errors?.ogImageUrl)} />
                  {state.errors?.ogImageUrl ? <FieldError>{state.errors.ogImageUrl}</FieldError> : null}
                </Field>
              </div>
              <Field orientation="horizontal" className="items-center rounded-lg border p-3">
                <Input id="noindex" name="noindex" type="checkbox" defaultChecked={post?.noIndex ?? false} className="size-4" />
                <FieldLabel htmlFor="noindex">KhÃ´ng index bÃ i viáº¿t nÃ y</FieldLabel>
              </Field>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-primary">{seoTitle || defaultSeoTitle || title}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">tekvora.com/articles/{slug}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {seoDescription || defaultSeoDescription || excerpt}
                </p>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Xuáº¥t báº£n</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(state.errors?.status)}>
                <FieldLabel htmlFor="status" required>Tráº¡ng thÃ¡i</FieldLabel>
                <select id="status" name="status" defaultValue={post?.status ?? "DRAFT"} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
                  {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                {state.errors?.status ? <FieldError>{state.errors.status}</FieldError> : null}
              </Field>
              <Field data-invalid={Boolean(state.errors?.type)}>
                <FieldLabel htmlFor="type" required>Loáº¡i ná»™i dung</FieldLabel>
                <select id="type" name="type" defaultValue={post?.type ?? "ARTICLE"} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
                  {postTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                {state.errors?.type ? <FieldError>{state.errors.type}</FieldError> : null}
              </Field>
              <Field data-invalid={Boolean(state.errors?.coverImageUrl)}>
                <FieldLabel htmlFor="coverImageUrl">Cover image URL</FieldLabel>
                {coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverImageUrl}
                    alt={title || "Cover image"}
                    className="aspect-video w-full rounded-lg border object-cover"
                  />
                ) : null}
                <Input id="coverImageUrl" name="coverImageUrl" value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} aria-invalid={Boolean(state.errors?.coverImageUrl)} />
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    event.target.value = ""
                    if (file) void uploadCoverImage(file)
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={coverUploading}
                  >
                    {coverUploading ? "Äang táº£i..." : "Táº£i áº£nh cover"}
                  </Button>
                  {coverImageUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCoverImageUrl("")}
                    >
                      XÃ³a áº£nh
                    </Button>
                  ) : null}
                </div>
                {coverUploadError ? <FieldError>{coverUploadError}</FieldError> : null}
                {state.errors?.coverImageUrl ? <FieldError>{state.errors.coverImageUrl}</FieldError> : null}
              </Field>
              <div className="flex gap-2">
                {post ? (
                  <Button asChild variant="outline">
                    <Link href={`/preview/${post.id}`} target="_blank">
                      <ExternalLinkIcon />
                      Preview
                    </Link>
                  </Button>
                ) : null}
                <SubmitButton>LÆ°u bÃ i viáº¿t</SubmitButton>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>PhÃ¢n loáº¡i</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="categoryId">Danh má»¥c</FieldLabel>
                <select id="categoryId" name="categoryId" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
                  <option value="">KhÃ´ng chá»n</option>
                  {options.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="authorId">TÃ¡c giáº£</FieldLabel>
                <select id="authorId" name="authorId" defaultValue={post?.authorId ?? ""} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
                  <option value="">KhÃ´ng chá»n</option>
                  {options.authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
                </select>
              </Field>
              <Field>
                <FieldLabel>Tháº»</FieldLabel>
                <div className="max-h-48 space-y-2 overflow-auto rounded-lg border p-3">
                  {tagOptions.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={(event) => {
                          setSelectedTags((current) =>
                            event.target.checked
                              ? [...current, tag.id]
                              : current.filter((id) => id !== tag.id)
                          )
                        }}
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newTagName} onChange={(event) => setNewTagName(event.target.value)} placeholder="Táº¡o tháº» má»›i" />
                  <Button type="button" variant="outline" onClick={() => void createTag()}>
                    Táº¡o tháº»
                  </Button>
                </div>
                {tagMessage ? <p className="text-sm text-muted-foreground">{tagMessage}</p> : null}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SEO checker</CardTitle>
            <CardDescription>Äiá»ƒm hiá»‡n táº¡i: {seo.score}%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {seo.items.map((item) => (
                <div key={item.key} className="flex gap-2 rounded-lg border p-2 text-sm">
                  {item.status === "good" ? (
                    <CheckCircle2Icon className="size-4 text-emerald-600" />
                  ) : item.status === "warning" ? (
                    <CircleAlertIcon className="size-4 text-amber-600" />
                  ) : (
                    <CircleXIcon className="size-4 text-destructive" />
                  )}
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.message}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <AdminBadge variant={seo.score >= 80 ? "green" : seo.score >= 50 ? "amber" : "neutral"}>
                {seo.score}% SEO
              </AdminBadge>
              <AdminBadge>{seo.wordCount} tá»«</AdminBadge>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
