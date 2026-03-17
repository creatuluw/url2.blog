/*
  Warnings:

  - You are about to drop the `saved_urls_to_url_categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "saved_urls_to_url_categories" DROP CONSTRAINT "saved_urls_to_url_categories_A_fkey";

-- DropForeignKey
ALTER TABLE "saved_urls_to_url_categories" DROP CONSTRAINT "saved_urls_to_url_categories_B_fkey";

-- DropTable
DROP TABLE "saved_urls_to_url_categories";

-- CreateTable
CREATE TABLE "_saved_urls_to_url_categories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_saved_urls_to_url_categories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_saved_urls_to_url_categories_B_index" ON "_saved_urls_to_url_categories"("B");

-- AddForeignKey
ALTER TABLE "_saved_urls_to_url_categories" ADD CONSTRAINT "_saved_urls_to_url_categories_A_fkey" FOREIGN KEY ("A") REFERENCES "saved_urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_saved_urls_to_url_categories" ADD CONSTRAINT "_saved_urls_to_url_categories_B_fkey" FOREIGN KEY ("B") REFERENCES "url_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
