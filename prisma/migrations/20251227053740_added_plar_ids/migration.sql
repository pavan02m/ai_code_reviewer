/*
  Warnings:

  - A unique constraint covering the columns `[polarCstomerId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[polarSubscriptionId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "polarCstomerId" TEXT,
ADD COLUMN     "polarSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_polarCstomerId_key" ON "user"("polarCstomerId");

-- CreateIndex
CREATE UNIQUE INDEX "user_polarSubscriptionId_key" ON "user"("polarSubscriptionId");
