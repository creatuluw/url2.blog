-- Rename tables from PascalCase to snake_case
ALTER TABLE "SavedUrl" RENAME TO "saved_urls";
ALTER TABLE "BlogPost" RENAME TO "blog_posts";

-- Rename columns in saved_urls table
ALTER TABLE "saved_urls" RENAME COLUMN "markdownContent" TO "markdown_content";
ALTER TABLE "saved_urls" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "saved_urls" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns in blog_posts table
ALTER TABLE "blog_posts" RENAME COLUMN "savedUrlId" TO "saved_url_id";
ALTER TABLE "blog_posts" RENAME COLUMN "blogReason" TO "blog_reason";
ALTER TABLE "blog_posts" RENAME COLUMN "additionalInstructions" TO "additional_instructions";
ALTER TABLE "blog_posts" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "blog_posts" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename unique index on saved_urls.url
ALTER INDEX "SavedUrl_url_key" RENAME TO "saved_urls_url_key";

-- Drop foreign key constraint first (before touching primary keys)
ALTER TABLE "blog_posts" DROP CONSTRAINT IF EXISTS "BlogPost_savedUrlId_fkey";

-- Rename primary key constraints
ALTER TABLE "saved_urls" DROP CONSTRAINT "SavedUrl_pkey";
ALTER TABLE "saved_urls" ADD CONSTRAINT "saved_urls_pkey" PRIMARY KEY ("id");

ALTER TABLE "blog_posts" DROP CONSTRAINT "BlogPost_pkey";
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");

-- Re-add foreign key constraint with new name
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_saved_url_id_fkey" FOREIGN KEY ("saved_url_id") REFERENCES "saved_urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add metadata columns to saved_urls
ALTER TABLE "saved_urls" ADD COLUMN "title" TEXT;
ALTER TABLE "saved_urls" ADD COLUMN "description" TEXT;
ALTER TABLE "saved_urls" ADD COLUMN "excerpt" TEXT;
ALTER TABLE "saved_urls" ADD COLUMN "thumbnail" TEXT;
ALTER TABLE "saved_urls" ADD COLUMN "favicon" TEXT;
ALTER TABLE "saved_urls" ADD COLUMN "author" TEXT;
ALTER TABLE "saved_urls" ADD COLUMN "site_name" TEXT;
ALTER TABLE "saved_urls" ADD COLUMN "published_date" TEXT;
