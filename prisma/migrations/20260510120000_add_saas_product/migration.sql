CREATE TABLE "SaaSProduct" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "shortDescription" TEXT,
  "description" TEXT,
  "logoUrl" TEXT,
  "websiteUrl" TEXT,
  "affiliateUrl" TEXT,
  "category" TEXT,
  "pricingModel" TEXT,
  "pricingFrom" DECIMAL(10,2),
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "rating" DECIMAL(3,1),
  "features" JSONB,
  "pros" JSONB,
  "cons" JSONB,
  "bestFor" JSONB,
  "alternatives" JSONB,
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

  CONSTRAINT "SaaSProduct_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SaaSProduct_slug_key" ON "SaaSProduct"("slug");
CREATE INDEX "SaaSProduct_status_category_isFeatured_order_idx" ON "SaaSProduct"("status", "category", "isFeatured", "order");
CREATE INDEX "SaaSProduct_rating_idx" ON "SaaSProduct"("rating");
