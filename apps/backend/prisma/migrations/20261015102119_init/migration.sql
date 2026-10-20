-- CreateTable
CREATE TABLE `settings` (
    `SettingId` INTEGER NOT NULL AUTO_INCREMENT,
    `UserId` VARCHAR(191) NOT NULL,
    `Notification` BOOLEAN NULL,
    `BioMatrics` BOOLEAN NULL,
    `COMPCODE` VARCHAR(191) NULL,

    UNIQUE INDEX `settings_UserId_key`(`UserId`),
    PRIMARY KEY (`SettingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifyapprovalgroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Idcard` VARCHAR(191) NULL,
    `COMPCODE` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `pic` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `otpemail` VARCHAR(191) NULL,
    `approval` VARCHAR(191) NOT NULL DEFAULT 'HOD',
    `password` VARCHAR(191) NULL,
    `Idcard` VARCHAR(191) NULL,
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

    UNIQUE INDEX `user_username_key`(`username`),
    UNIQUE INDEX `user_Idcard_key`(`Idcard`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `onduty` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docid` VARCHAR(50) NOT NULL,
    `docdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idcard` VARCHAR(200) NOT NULL,
    `empname` VARCHAR(100) NULL,
    `hod` VARCHAR(191) NULL,
    `hr` VARCHAR(191) NULL,
    `Svechilekm` VARCHAR(191) NULL,
    `Evechilekm` VARCHAR(191) NULL,
    `approvalStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `userId` VARCHAR(191) NULL,
    `others` VARCHAR(191) NULL,
    `group` VARCHAR(191) NOT NULL DEFAULT 'onduty',
    `in_time` VARCHAR(191) NULL,
    `out_time` VARCHAR(191) NULL,
    `inout` VARCHAR(191) NOT NULL DEFAULT 'IN',
    `photo` VARCHAR(191) NULL,
    `reject_reason` VARCHAR(191) NULL,
    `compCode` VARCHAR(191) NOT NULL,
    `updatedOn` DATETIME(3) NULL,
    `in_location` VARCHAR(191) NULL,
    `in_latitude` VARCHAR(191) NULL,
    `in_longtiude` VARCHAR(191) NULL,
    `vechileno` VARCHAR(191) NULL,
    `bunk` VARCHAR(191) NULL,
    `start_km` VARCHAR(191) NULL,
    `end_km` VARCHAR(191) NULL,
    `out_location` VARCHAR(191) NULL,
    `out_latitude` VARCHAR(191) NULL,
    `out_longtiude` VARCHAR(191) NULL,
    `to_onduty` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` VARCHAR(191) NULL,
    `modified_By` VARCHAR(191) NULL,
    `rejectBy` VARCHAR(191) NULL DEFAULT '',
    `approvedBy` VARCHAR(191) NULL DEFAULT '',
    `create` INTEGER NOT NULL DEFAULT 0,
    `update` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `category` INTEGER NULL DEFAULT 1,

    UNIQUE INDEX `onduty_docid_key`(`docid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `advance_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docid` VARCHAR(50) NOT NULL,
    `docdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idcard` VARCHAR(200) NOT NULL,
    `fromDate` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `toDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `empname` VARCHAR(100) NOT NULL,
    `finyear` VARCHAR(10) NOT NULL,
    `advtype` VARCHAR(30) NOT NULL,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `paytype` VARCHAR(191) NULL,
    `hod` VARCHAR(191) NOT NULL,
    `hr` VARCHAR(191) NULL,
    `group` VARCHAR(191) NOT NULL DEFAULT 'Advance',
    `isCancelled` BOOLEAN NOT NULL DEFAULT false,
    `userId` VARCHAR(191) NOT NULL,
    `preloan` INTEGER NULL DEFAULT 0,
    `totalloan` DOUBLE NOT NULL DEFAULT 0,
    `predue` VARCHAR(200) NULL DEFAULT '0',
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
    `modified_By` VARCHAR(191) NOT NULL,
    `rejectBy` VARCHAR(191) NULL DEFAULT '',
    `approvedBy` VARCHAR(191) NULL DEFAULT '',
    `category` INTEGER NOT NULL DEFAULT 1,
    `fincode` BIGINT NOT NULL,
    `paycode` BIGINT NOT NULL,

    UNIQUE INDEX `advance_requests_docid_key`(`docid`),
    INDEX `advance_requests_idcard_idx`(`idcard`),
    INDEX `advance_requests_finyear_idx`(`finyear`),
    INDEX `advance_requests_approvalStatus_idx`(`approvalStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companycode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Idcard` VARCHAR(191) NOT NULL,
    `companyCode` VARCHAR(191) NOT NULL,
    `GCOMP` VARCHAR(191) NULL,
    `companyid` VARCHAR(191) NOT NULL,

    INDEX `companycode_Idcard_idx`(`Idcard`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userlog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `User` VARCHAR(191) NULL,
    `MobileName` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `MobileIP` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `Idcard` VARCHAR(191) NULL,
    `COMPCODE` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissiondocid` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `count` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissionmaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` VARCHAR(191) NOT NULL,
    `ptype` VARCHAR(191) NULL,
    `COMPCODE` VARCHAR(191) NOT NULL DEFAULT 'null',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ondutymaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` VARCHAR(191) NOT NULL,
    `COMPCODE` VARCHAR(191) NOT NULL DEFAULT 'null',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `timestamp` BIGINT NOT NULL,
    `accuracy` DOUBLE NULL,
    `speed` DOUBLE NULL,
    `bearing` DOUBLE NULL,
    `altitude` DOUBLE NULL,
    `provider` VARCHAR(191) NULL,
    `COMPCODE` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissionentry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `modified_By` VARCHAR(191) NOT NULL,
    `modifiedOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `group` VARCHAR(191) NOT NULL DEFAULT 'Permission',
    `isCancelled` BOOLEAN NOT NULL DEFAULT false,
    `userId` VARCHAR(191) NOT NULL,
    `compCode` VARCHAR(191) NOT NULL,
    `docid` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NOT NULL,
    `fTime` VARCHAR(191) NOT NULL,
    `tTime` VARCHAR(191) NOT NULL,
    `thrs` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NULL,
    `create` INTEGER NOT NULL DEFAULT 0,
    `update` INTEGER NOT NULL DEFAULT 0,
    `approvedBy` VARCHAR(191) NULL DEFAULT '',
    `rejectBy` VARCHAR(191) NULL DEFAULT '',
    `permissionId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NULL DEFAULT '',
    `reason` VARCHAR(191) NULL,
    `approvalStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `hod` VARCHAR(191) NOT NULL,
    `hr` VARCHAR(191) NULL,
    `category` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `permissionentry_docid_key`(`docid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trackers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `UserId` VARCHAR(191) NULL,
    `isLive` BOOLEAN NOT NULL DEFAULT false,
    `COMPCODE` VARCHAR(191) NULL,
    `docid` VARCHAR(191) NULL,
    `empname` VARCHAR(191) NULL,
    `endDocid` VARCHAR(191) NULL,

    UNIQUE INDEX `trackers_UserId_key`(`UserId`),
    UNIQUE INDEX `trackers_docid_key`(`docid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vechilekm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `VEHICLENO` VARCHAR(191) NULL,
    `COMPCODE` VARCHAR(191) NULL,
    `km` VARCHAR(191) NULL,

    UNIQUE INDEX `vechilekm_VEHICLENO_key`(`VEHICLENO`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leaveentry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `modified_By` VARCHAR(191) NOT NULL,
    `modifiedOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isCancelled` BOOLEAN NOT NULL DEFAULT false,
    `userId` VARCHAR(191) NOT NULL,
    `compCode` VARCHAR(191) NOT NULL,
    `group` VARCHAR(191) NOT NULL DEFAULT 'Leave',
    `finyear` VARCHAR(191) NOT NULL,
    `docid` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NOT NULL,
    `fromDate` DATETIME(3) NOT NULL,
    `toDate` DATETIME(3) NOT NULL,
    `totalDays` DOUBLE NOT NULL,
    `hr` VARCHAR(191) NULL,
    `ltype` VARCHAR(191) NULL,
    `fltype` VARCHAR(191) NULL,
    `tltype` VARCHAR(191) NULL,
    `mobile` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,
    `approvalStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `approvedBy` VARCHAR(191) NULL DEFAULT '',
    `rejectBy` VARCHAR(191) NULL DEFAULT '',
    `hod` VARCHAR(191) NOT NULL,
    `leaveId` VARCHAR(191) NOT NULL,
    `create` INTEGER NOT NULL DEFAULT 0,
    `empname` VARCHAR(191) NULL,
    `update` INTEGER NOT NULL DEFAULT 0,
    `category` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `leaveentry_docid_key`(`docid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `COMPCODE` VARCHAR(191) NOT NULL DEFAULT '',
    `active` VARCHAR(191) NOT NULL DEFAULT 'Yes',
    `defaultRole` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roleonpage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NULL,
    `roleName` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `create` BOOLEAN NOT NULL DEFAULT false,
    `edit` BOOLEAN NOT NULL DEFAULT false,
    `link` VARCHAR(191) NOT NULL,
    `delete` BOOLEAN NOT NULL DEFAULT false,
    `isdefault` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
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
ALTER TABLE `settings` ADD CONSTRAINT `settings_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `user`(`Idcard`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`name`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `onduty` ADD CONSTRAINT `onduty_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `onduty` ADD CONSTRAINT `onduty_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `onduty` ADD CONSTRAINT `onduty_modified_By_fkey` FOREIGN KEY (`modified_By`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `onduty` ADD CONSTRAINT `onduty_category_fkey` FOREIGN KEY (`category`) REFERENCES `ondutymaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_requests` ADD CONSTRAINT `advance_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_requests` ADD CONSTRAINT `advance_requests_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_requests` ADD CONSTRAINT `advance_requests_modified_By_fkey` FOREIGN KEY (`modified_By`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_requests` ADD CONSTRAINT `advance_requests_category_fkey` FOREIGN KEY (`category`) REFERENCES `permissionmaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `companycode` ADD CONSTRAINT `companycode_Idcard_fkey` FOREIGN KEY (`Idcard`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissionentry` ADD CONSTRAINT `permissionentry_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissionentry` ADD CONSTRAINT `permissionentry_modified_By_fkey` FOREIGN KEY (`modified_By`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissionentry` ADD CONSTRAINT `permissionentry_category_fkey` FOREIGN KEY (`category`) REFERENCES `permissionmaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissionentry` ADD CONSTRAINT `permissionentry_hod_fkey` FOREIGN KEY (`hod`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissionentry` ADD CONSTRAINT `permissionentry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leaveentry` ADD CONSTRAINT `leaveentry_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leaveentry` ADD CONSTRAINT `leaveentry_modified_By_fkey` FOREIGN KEY (`modified_By`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leaveentry` ADD CONSTRAINT `leaveentry_hod_fkey` FOREIGN KEY (`hod`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leaveentry` ADD CONSTRAINT `leaveentry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leaveentry` ADD CONSTRAINT `leaveentry_category_fkey` FOREIGN KEY (`category`) REFERENCES `permissionmaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roleonpage` ADD CONSTRAINT `roleonpage_roleName_fkey` FOREIGN KEY (`roleName`) REFERENCES `role`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NotifyApprovalGroupToUser` ADD CONSTRAINT `_NotifyApprovalGroupToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `notifyapprovalgroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NotifyApprovalGroupToUser` ADD CONSTRAINT `_NotifyApprovalGroupToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionEntryToUser` ADD CONSTRAINT `_PermissionEntryToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `permissionentry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionEntryToUser` ADD CONSTRAINT `_PermissionEntryToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
