-- CreateTable
CREATE TABLE "FeatureUsage" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeatureUsage_userId_feature_key" ON "FeatureUsage"("userId", "feature");
