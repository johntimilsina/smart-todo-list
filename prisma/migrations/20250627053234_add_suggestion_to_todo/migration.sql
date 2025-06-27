-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "suggestion" TEXT[] DEFAULT ARRAY[]::TEXT[];
