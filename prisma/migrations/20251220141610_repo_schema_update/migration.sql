/*
  Warnings:

  - Added the required column `url` to the `repository` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "repository" ADD COLUMN     "url" TEXT NOT NULL;
