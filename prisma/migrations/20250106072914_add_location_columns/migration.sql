-- AlterTable
ALTER TABLE "School" ADD COLUMN     "country_en" TEXT,
ADD COLUMN     "country_jp" TEXT,
ADD COLUMN     "geography_en" TEXT,
ADD COLUMN     "geography_jp" TEXT,
ADD COLUMN     "region_en" TEXT,
ADD COLUMN     "region_jp" TEXT;

-- CreateIndex
CREATE INDEX "idx_school_country" ON "School"("country_en", "country_jp");

-- CreateIndex
CREATE INDEX "idx_school_region" ON "School"("region_en", "region_jp");

-- CreateIndex
CREATE INDEX "idx_school_geography" ON "School"("geography_en", "geography_jp");
