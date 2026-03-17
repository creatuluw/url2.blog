-- Baseline migration: represents the current database state
-- This migration is marked as already applied since it matches the existing database

-- CreateTable
CREATE TABLE "SavedUrl" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "markdownContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedUrl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "savedUrlId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "frontmatter" JSONB NOT NULL,
    "tone" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "blogReason" TEXT NOT NULL,
    "additionalInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedUrl_url_key" ON "SavedUrl"("url");

-- CreateIndex
CREATE INDEX "BlogPost_savedUrlId_idx" ON "BlogPost"("savedUrlId");

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_savedUrlId_fkey" FOREIGN KEY ("savedUrlId") REFERENCES "SavedUrl"("id") ON DELETE CASCADE ON UPDATE CASCADE;
