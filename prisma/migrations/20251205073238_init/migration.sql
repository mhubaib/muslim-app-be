/*
  Warnings:

  - You are about to drop the column `ayahNumber` on the `Ayah` table. All the data in the column will be lost.
  - Added the required column `numberInSurah` to the `Ayah` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ayah" DROP COLUMN "ayahNumber",
ADD COLUMN     "numberInSurah" INTEGER NOT NULL;
