-- AlterTable
ALTER TABLE "saved_urls" ADD COLUMN "tags" TEXT[];

-- CreateTable
CREATE TABLE "url_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "url_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_urls_to_url_categories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "saved_urls_to_url_categories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "url_categories_name_key" ON "url_categories"("name");

-- CreateIndex
CREATE INDEX "saved_urls_to_url_categories_B_index" ON "saved_urls_to_url_categories"("B");

-- AddForeignKey
ALTER TABLE "saved_urls_to_url_categories" ADD CONSTRAINT "saved_urls_to_url_categories_A_fkey" FOREIGN KEY ("A") REFERENCES "saved_urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_urls_to_url_categories" ADD CONSTRAINT "saved_urls_to_url_categories_B_fkey" FOREIGN KEY ("B") REFERENCES "url_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
