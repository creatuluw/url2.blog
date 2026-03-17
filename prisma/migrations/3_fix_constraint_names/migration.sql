-- Fix primary key constraint names from _new suffix
-- Must drop foreign key constraint first before touching primary keys

-- Drop foreign key constraint
ALTER TABLE "blog_posts" DROP CONSTRAINT IF EXISTS "blog_posts_saved_url_id_fkey";

-- Fix primary key constraint names
ALTER TABLE "saved_urls" DROP CONSTRAINT "saved_urls_new_pkey";
ALTER TABLE "saved_urls" ADD CONSTRAINT "saved_urls_pkey" PRIMARY KEY ("id");

ALTER TABLE "blog_posts" DROP CONSTRAINT "blog_posts_new_pkey";
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");

-- Re-add foreign key constraint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_saved_url_id_fkey" FOREIGN KEY ("saved_url_id") REFERENCES "saved_urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
