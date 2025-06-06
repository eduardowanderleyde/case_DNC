/*
  Warnings:

  - Added the required column `imageUrl` to the `Monster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Monster` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Monster" ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
