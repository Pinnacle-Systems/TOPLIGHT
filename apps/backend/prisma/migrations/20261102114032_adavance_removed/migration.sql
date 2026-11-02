/*
  Warnings:

  - You are about to drop the `advancerequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `advancerequest` DROP FOREIGN KEY `AdvanceRequest_category_fkey`;

-- DropForeignKey
ALTER TABLE `advancerequest` DROP FOREIGN KEY `AdvanceRequest_createdBy_fkey`;

-- DropForeignKey
ALTER TABLE `advancerequest` DROP FOREIGN KEY `AdvanceRequest_modifiedBy_fkey`;

-- DropForeignKey
ALTER TABLE `advancerequest` DROP FOREIGN KEY `AdvanceRequest_userId_fkey`;

-- DropTable
DROP TABLE `advancerequest`;
