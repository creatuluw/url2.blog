-- Reorder columns by recreating tables with correct column order

-- Step 1: Create new tables with correct column order

-- New saved_urls table with correct column order:
-- id, url, title, description, excerpt, thumbnail, favicon, author, site_name, published_date, markdown_content, created_at, updated_at
CREATE TABLE "saved_urls_new" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "excerpt" TEXT,
    "thumbnail" TEXT,
    "favicon" TEXT,
    "author" TEXT,
    "site_name" TEXT,
    "published_date" TEXT,
    "markdown_content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "saved_urls_new_pkey" PRIMARY KEY ("id")
);

-- New blog_posts table with correct column order:
-- id, saved_url_id, title, content, frontmatter, tone, format, category, tags, blog_reason, additional_instructions, created_at, updated_at
CREATE TABLE "blog_posts_new" (
    "id" TEXT NOT NULL,
    "saved_url_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "frontmatter" JSONB NOT NULL,
    "tone" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "blog_reason" TEXT NOT NULL,
    "additional_instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "blog_posts_new_pkey" PRIMARY KEY ("id")
);

-- Step 2: Copy data from old tables to new tables
INSERT INTO "saved_urls_new" ("id", "url", "title", "description", "excerpt", "thumbnail", "favicon", "author", "site_name", "published_date", "markdown_content", "created_at", "updated_at")
SELECT "id", "url", "title", "description", "excerpt", "thumbnail", "favicon", "author", "site_name", "published_date", "markdown_content", "created_at", "updated_at"
FROM "saved_urls";

INSERT INTO "blog_posts_new" ("id", "saved_url_id", "title", "content", "frontmatter", "tone", "format", "category", "tags", "blog_reason", "additional_instructions", "created_at", "updated_at")
SELECT "id", "saved_url_id", "title", "content", "frontmatter", "tone", "format", "category", "tags", "blog_reason", "additional_instructions", "created_at", "updated_at"
FROM "blog_posts";

-- Step 3: Drop old tables (this also drops the foreign key constraint automatically)
DROP TABLE "blog_posts";
DROP TABLE "saved_urls";

-- Step 4: Rename new tables to original names
ALTER TABLE "saved_urls_new" RENAME TO "saved_urls";
ALTER TABLE "blog_posts_new" RENAME TO "blog_posts";

-- Step 5: Recreate indexes and constraints
CREATE UNIQUE INDEX "saved_urls_url_key" ON "saved_urls"("url");
CREATE INDEX "blog_posts_saved_url_id_idx" ON "blog_posts"("saved_url_id");
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_saved_url_id_fkey" FOREIGN KEY ("saved_url_id") REFERENCES "saved_urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
