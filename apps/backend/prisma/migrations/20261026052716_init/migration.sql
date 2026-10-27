-- CreateTable
CREATE TABLE `Settings` (
    `settingId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `notification` BOOLEAN NULL,
    `bioMatrics` BOOLEAN NULL,
    `compCode` VARCHAR(191) NULL,

    UNIQUE INDEX `Settings_userId_key`(`userId`),
    PRIMARY KEY (`settingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotifyApprovalGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idCard` VARCHAR(191) NULL,
    `compCode` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userName` VARCHAR(191) NOT NULL,
    `pic` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `otpEmail` VARCHAR(191) NULL,
    `approval` VARCHAR(191) NOT NULL DEFAULT 'HOD',
    `password` VARCHAR(191) NULL,
    `idCard` VARCHAR(191) NULL,
    `roleId` VARCHAR(191) NULL,
    `otp` VARCHAR(191) NULL,
    `hod` VARCHAR(191) NULL,
    `hr` VARCHAR(191) NULL,
    `level` VARCHAR(191) NOT NULL DEFAULT 'user',
    `verificationOtp` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `active` BOOLEAN NOT NULL DEFAULT true,
    `employeeId` INTEGER NULL,
    `isAllParty` BOOLEAN NOT NULL DEFAULT false,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `fcm` VARCHAR(191) NULL DEFAULT '',

    UNIQUE INDEX `User_userName_key`(`userName`),
    UNIQUE INDEX `User_idCard_key`(`idCard`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Onduty` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(50) NOT NULL,
    `docDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idCard` VARCHAR(200) NOT NULL,
    `empName` VARCHAR(100) NULL,
    `hod` VARCHAR(191) NULL,
    `hr` VARCHAR(191) NULL,
    `startVehicleKm` VARCHAR(191) NULL,
    `endVehicleKm` VARCHAR(191) NULL,
    `approvalStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `userId` VARCHAR(191) NULL,
    `others` VARCHAR(191) NULL,
    `group` VARCHAR(191) NOT NULL DEFAULT 'onduty',
    `inTime` VARCHAR(191) NULL,
    `outTime` VARCHAR(191) NULL,
    `inOut` VARCHAR(191) NOT NULL DEFAULT 'IN',
    `photo` VARCHAR(191) NULL,
    `rejectReason` VARCHAR(191) NULL,
    `compCode` VARCHAR(191) NOT NULL,
    `updatedOn` DATETIME(3) NULL,
    `inLocation` VARCHAR(191) NULL,
    `inLatitude` VARCHAR(191) NULL,
    `inLongtiude` VARCHAR(191) NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `bunk` VARCHAR(191) NULL,
    `startKm` VARCHAR(191) NULL,
    `endKm` VARCHAR(191) NULL,
    `outLocation` VARCHAR(191) NULL,
    `outLatitude` VARCHAR(191) NULL,
    `outLongtiude` VARCHAR(191) NULL,
    `toOnduty` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` VARCHAR(191) NULL,
    `modifiedBy` VARCHAR(191) NULL,
    `rejectBy` VARCHAR(191) NULL DEFAULT '',
    `approvedBy` VARCHAR(191) NULL DEFAULT '',
    `create` INTEGER NOT NULL DEFAULT 0,
    `update` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `category` INTEGER NULL DEFAULT 1,

    UNIQUE INDEX `Onduty_docId_key`(`docId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdvanceRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(50) NOT NULL,
    `docDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idCard` VARCHAR(200) NOT NULL,
    `fromDate` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `toDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `empName` VARCHAR(100) NOT NULL,
    `finYear` VARCHAR(10) NOT NULL,
    `advType` VARCHAR(30) NOT NULL,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `payType` VARCHAR(191) NULL,
    `hod` VARCHAR(191) NOT NULL,
    `hr` VARCHAR(191) NULL,
    `group` VARCHAR(191) NOT NULL DEFAULT 'Advance',
    `isCancelled` BOOLEAN NOT NULL DEFAULT false,
    `userId` VARCHAR(191) NOT NULL,
    `preLoan` INTEGER NULL DEFAULT 0,
    `totalLoan` DOUBLE NOT NULL DEFAULT 0,
    `preDue` VARCHAR(200) NULL DEFAULT '0',
    `ins` INTEGER NOT NULL DEFAULT 0,
    `due` INTEGER NOT NULL DEFAULT 0,
    `remark` VARCHAR(500) NOT NULL,
    `approvalStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `compCode` VARCHAR(191) NOT NULL,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NULL,
    `create` INTEGER NOT NULL DEFAULT 0,
    `update` INTEGER NOT NULL DEFAULT 0,
    `modifiedBy` VARCHAR(191) NOT NULL,
    `rejectBy` VARCHAR(191) NULL DEFAULT '',
    `approvedBy` VARCHAR(191) NULL DEFAULT '',
    `category` INTEGER NOT NULL DEFAULT 1,
    `finCode` BIGINT NOT NULL,
    `payCode` BIGINT NOT NULL,

    UNIQUE INDEX `AdvanceRequest_docId_key`(`docId`),
    INDEX `AdvanceRequest_idCard_idx`(`idCard`),
    INDEX `AdvanceRequest_finYear_idx`(`finYear`),
    INDEX `AdvanceRequest_approvalStatus_idx`(`approvalStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompanyCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idCard` VARCHAR(191) NOT NULL,
    `companyCode` VARCHAR(191) NOT NULL,
    `gComp` VARCHAR(191) NULL,
    `companyId` VARCHAR(191) NOT NULL,

    INDEX `CompanyCode_idCard_idx`(`idCard`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user` VARCHAR(191) NULL,
    `mobileName` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mobileIp` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `idCard` VARCHAR(191) NULL,
    `compCode` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PermissionDocId` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `count` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PermissionMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` VARCHAR(191) NOT NULL,
    `pType` VARCHAR(191) NULL,
    `compCode` VARCHAR(191) NOT NULL DEFAULT 'null',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OndutyMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` VARCHAR(191) NOT NULL,
    `compCode` VARCHAR(191) NOT NULL DEFAULT 'null',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `timeStamp` BIGINT NOT NULL,
    `accuracy` DOUBLE NULL,
    `speed` DOUBLE NULL,
    `bearing` DOUBLE NULL,
    `altitude` DOUBLE NULL,
    `provider` VARCHAR(191) NULL,
    `compCode` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PermissionEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `modifiedBy` VARCHAR(191) NOT NULL,
    `modifiedOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `group` VARCHAR(191) NOT NULL DEFAULT 'Permission',
    `isCancelled` BOOLEAN NOT NULL DEFAULT false,
    `userId` VARCHAR(191) NOT NULL,
    `compCode` VARCHAR(191) NOT NULL,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NOT NULL,
    `fTime` VARCHAR(191) NOT NULL,
    `tTime` VARCHAR(191) NOT NULL,
    `totalHrs` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NULL,
    `create` INTEGER NOT NULL DEFAULT 0,
    `update` INTEGER NOT NULL DEFAULT 0,
    `approvedBy` VARCHAR(191) NULL DEFAULT '',
    `rejectBy` VARCHAR(191) NULL DEFAULT '',
    `permissionId` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NULL DEFAULT '',
    `reason` VARCHAR(191) NULL,
    `approvalStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `hod` VARCHAR(191) NOT NULL,
    `hr` VARCHAR(191) NULL,
    `category` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `PermissionEntry_docId_key`(`docId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trackers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NULL,
    `isLive` BOOLEAN NOT NULL DEFAULT false,
    `compCode` VARCHAR(191) NULL,
    `docId` VARCHAR(191) NULL,
    `empName` VARCHAR(191) NULL,
    `endDocId` VARCHAR(191) NULL,

    UNIQUE INDEX `Trackers_userId_key`(`userId`),
    UNIQUE INDEX `Trackers_docId_key`(`docId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vechilekm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleNo` VARCHAR(191) NULL,
    `compCode` VARCHAR(191) NULL,
    `km` VARCHAR(191) NULL,

    UNIQUE INDEX `Vechilekm_vehicleNo_key`(`vehicleNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `modifiedBy` VARCHAR(191) NOT NULL,
    `modifiedOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isCancelled` BOOLEAN NOT NULL DEFAULT false,
    `userId` VARCHAR(191) NOT NULL,
    `compCode` VARCHAR(191) NOT NULL,
    `group` VARCHAR(191) NOT NULL DEFAULT 'Leave',
    `finYear` VARCHAR(191) NOT NULL,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NOT NULL,
    `fromDate` DATETIME(3) NOT NULL,
    `toDate` DATETIME(3) NOT NULL,
    `totalDays` DOUBLE NOT NULL,
    `hr` VARCHAR(191) NULL,
    `lType` VARCHAR(191) NULL,
    `flType` VARCHAR(191) NULL,
    `tlType` VARCHAR(191) NULL,
    `mobile` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,
    `approvalStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `approvedBy` VARCHAR(191) NULL DEFAULT '',
    `rejectBy` VARCHAR(191) NULL DEFAULT '',
    `hod` VARCHAR(191) NOT NULL,
    `leaveId` VARCHAR(191) NOT NULL,
    `create` INTEGER NOT NULL DEFAULT 0,
    `empName` VARCHAR(191) NULL,
    `update` INTEGER NOT NULL DEFAULT 0,
    `category` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `LeaveEntry_docId_key`(`docId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `compCode` VARCHAR(191) NOT NULL DEFAULT '',
    `active` VARCHAR(191) NOT NULL DEFAULT 'Yes',
    `defaultRole` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoleOnPage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NULL,
    `roleName` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `create` BOOLEAN NOT NULL DEFAULT false,
    `edit` BOOLEAN NOT NULL DEFAULT false,
    `link` VARCHAR(191) NOT NULL,
    `delete` BOOLEAN NOT NULL DEFAULT false,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `costingId` INTEGER NOT NULL,
    `senderId` INTEGER NOT NULL,
    `receiverId` INTEGER NULL,
    `type` VARCHAR(191) NULL,
    `message` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_NotifyApprovalGroupToUser` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_NotifyApprovalGroupToUser_AB_unique`(`A`, `B`),
    INDEX `_NotifyApprovalGroupToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PermissionEntryToUser` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PermissionEntryToUser_AB_unique`(`A`, `B`),
    INDEX `_PermissionEntryToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Settings` ADD CONSTRAINT `Settings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`idCard`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`name`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Onduty` ADD CONSTRAINT `Onduty_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Onduty` ADD CONSTRAINT `Onduty_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Onduty` ADD CONSTRAINT `Onduty_modifiedBy_fkey` FOREIGN KEY (`modifiedBy`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Onduty` ADD CONSTRAINT `Onduty_category_fkey` FOREIGN KEY (`category`) REFERENCES `OndutyMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvanceRequest` ADD CONSTRAINT `AdvanceRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvanceRequest` ADD CONSTRAINT `AdvanceRequest_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvanceRequest` ADD CONSTRAINT `AdvanceRequest_modifiedBy_fkey` FOREIGN KEY (`modifiedBy`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvanceRequest` ADD CONSTRAINT `AdvanceRequest_category_fkey` FOREIGN KEY (`category`) REFERENCES `PermissionMaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanyCode` ADD CONSTRAINT `CompanyCode_idCard_fkey` FOREIGN KEY (`idCard`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermissionEntry` ADD CONSTRAINT `PermissionEntry_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermissionEntry` ADD CONSTRAINT `PermissionEntry_modifiedBy_fkey` FOREIGN KEY (`modifiedBy`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermissionEntry` ADD CONSTRAINT `PermissionEntry_category_fkey` FOREIGN KEY (`category`) REFERENCES `PermissionMaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermissionEntry` ADD CONSTRAINT `PermissionEntry_hod_fkey` FOREIGN KEY (`hod`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermissionEntry` ADD CONSTRAINT `PermissionEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveEntry` ADD CONSTRAINT `LeaveEntry_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveEntry` ADD CONSTRAINT `LeaveEntry_modifiedBy_fkey` FOREIGN KEY (`modifiedBy`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveEntry` ADD CONSTRAINT `LeaveEntry_hod_fkey` FOREIGN KEY (`hod`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveEntry` ADD CONSTRAINT `LeaveEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`idCard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveEntry` ADD CONSTRAINT `LeaveEntry_category_fkey` FOREIGN KEY (`category`) REFERENCES `PermissionMaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleOnPage` ADD CONSTRAINT `RoleOnPage_roleName_fkey` FOREIGN KEY (`roleName`) REFERENCES `Role`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NotifyApprovalGroupToUser` ADD CONSTRAINT `_NotifyApprovalGroupToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `NotifyApprovalGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NotifyApprovalGroupToUser` ADD CONSTRAINT `_NotifyApprovalGroupToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionEntryToUser` ADD CONSTRAINT `_PermissionEntryToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `PermissionEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionEntryToUser` ADD CONSTRAINT `_PermissionEntryToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
