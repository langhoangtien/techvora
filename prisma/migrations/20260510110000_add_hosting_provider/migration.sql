CREATE TABLE "HostingProvider" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "shortDescription" TEXT,
  "description" TEXT,
  "logoUrl" TEXT,
  "websiteUrl" TEXT,
  "affiliateUrl" TEXT,
  "pricingFrom" DECIMAL(10,2),
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "rating" DECIMAL(3,1),
  "pros" JSONB,
  "cons" JSONB,
  "features" JSONB,
  "bestFor" JSONB,
  "performanceNotes" TEXT,
  "supportNotes" TEXT,
  "dataCenterLocations" JSONB,
  "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "canonicalUrl" TEXT,
  "ogImageUrl" TEXT,
  "noindex" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "HostingProvider_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HostingProvider_slug_key" ON "HostingProvider"("slug");
CREATE INDEX "HostingProvider_status_isFeatured_order_idx" ON "HostingProvider"("status", "isFeatured", "order");
CREATE INDEX "HostingProvider_rating_idx" ON "HostingProvider"("rating");
