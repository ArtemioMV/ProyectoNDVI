-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "coveragePrice" DECIMAL(10,2),
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "installPrice" DECIMAL(10,2),
ADD COLUMN     "isInstallationMaterial" BOOLEAN NOT NULL DEFAULT false;
