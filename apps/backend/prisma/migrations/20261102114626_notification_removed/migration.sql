/*
  Warnings:

  - You are about to drop the `_notifyapprovalgrouptouser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifyapprovalgroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_notifyapprovalgrouptouser` DROP FOREIGN KEY `_NotifyApprovalGroupToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_notifyapprovalgrouptouser` DROP FOREIGN KEY `_NotifyApprovalGroupToUser_B_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_receiverId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_senderId_fkey`;

-- DropTable
DROP TABLE `_notifyapprovalgrouptouser`;

-- DropTable
DROP TABLE `notification`;

-- DropTable
DROP TABLE `notifyapprovalgroup`;
