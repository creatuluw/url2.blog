-- Fix primary key constraint names from _new suffix
-- Must drop foreign key constraint first before touching primary keys

-- Drop foreign key constraint if it exists
ALTER TABLE "blog_posts" DROP CONSTRAINT IF EXISTS "blog_posts_saved_url_id_fkey";

-- Fix primary key constraint names if they have the _new suffix
-- Check if the old constraint exists before dropping
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'saved_urls_new_pkey'
        AND conrelid = 'saved_urls'::regclass
    ) THEN
        ALTER TABLE "saved_urls" DROP CONSTRAINT "saved_urls_new_pkey";
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'saved_urls_pkey'
        AND conrelid = 'saved_urls'::regclass
    ) THEN
        ALTER TABLE "saved_urls" ADD CONSTRAINT "saved_urls_pkey" PRIMARY KEY ("id");
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'blog_posts_new_pkey'
        AND conrelid = 'blog_posts'::regclass
    ) THEN
        ALTER TABLE "blog_posts" DROP CONSTRAINT "blog_posts_new_pkey";
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'blog_posts_pkey'
        AND conrelid = 'blog_posts'::regclass
    ) THEN
        ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");
    END IF;
END
$$;

-- Re-add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'blog_posts_saved_url_id_fkey'
        AND conrelid = 'blog_posts'::regclass
    ) THEN
        ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_saved_url_id_fkey"
        FOREIGN KEY ("saved_url_id") REFERENCES "saved_urls"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;
