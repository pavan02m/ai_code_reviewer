/*
  Warnings:

  - You are about to drop the column `polarCstomerId` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[polarCustomerId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_polarCstomerId_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "polarCstomerId",
ADD COLUMN     "polarCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_polarCustomerId_key" ON "user"("polarCustomerId");
