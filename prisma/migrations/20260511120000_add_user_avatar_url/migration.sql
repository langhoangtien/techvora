ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;

UPDATE "User"
SET "avatarUrl" = "image"
WHERE "avatarUrl" IS NULL AND "image" IS NOT NULL;
