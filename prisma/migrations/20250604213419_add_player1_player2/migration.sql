/*
  Warnings:

  - The `battleLog` column on the `Arena` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `ownerId` on table `Monster` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Monster" DROP CONSTRAINT "Monster_ownerId_fkey";

-- AlterTable
ALTER TABLE "Arena" ADD COLUMN     "player1Id" INTEGER,
ADD COLUMN     "player2Id" INTEGER,
DROP COLUMN "battleLog",
ADD COLUMN     "battleLog" TEXT[];

-- AlterTable
ALTER TABLE "Monster" ALTER COLUMN "ownerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Monster" ADD CONSTRAINT "Monster_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arena" ADD CONSTRAINT "Arena_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arena" ADD CONSTRAINT "Arena_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
