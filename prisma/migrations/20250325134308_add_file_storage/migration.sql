/*
  Warnings:

  - You are about to drop the column `text` on the `Document` table. All the data in the column will be lost.
  - Added the required column `fileData` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "text",
ADD COLUMN     "fileData" BYTEA NOT NULL;
