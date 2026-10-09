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
CREATE TABLE `NotifyApprovalGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Idcard` VARCHAR(191) NULL,
    `COMPCODE` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
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

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_Idcard_key`(`Idcard`),
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
CREATE TABLE `CompanyCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Idcard` VARCHAR(191) NOT NULL,
    `companyCode` VARCHAR(191) NOT NULL,
    `GCOMP` VARCHAR(191) NULL,
    `companyid` VARCHAR(191) NOT NULL,

    INDEX `CompanyCode_Idcard_idx`(`Idcard`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserLog` (
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
CREATE TABLE `PermissionDocID` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `count` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PermissionMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` VARCHAR(191) NOT NULL,
    `ptype` VARCHAR(191) NULL,
    `COMPCODE` VARCHAR(191) NOT NULL DEFAULT 'null',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OndutyMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` VARCHAR(191) NOT NULL,
    `COMPCODE` VARCHAR(191) NOT NULL DEFAULT 'null',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
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
CREATE TABLE `PermissionEntry` (
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

    UNIQUE INDEX `PermissionEntry_docid_key`(`docid`),
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
CREATE TABLE `chat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `groupId` VARCHAR(191) NULL,
    `COMPCODE` VARCHAR(191) NULL,
    `text` VARCHAR(191) NULL,
    `sender` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

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
CREATE TABLE `LeaveEntry` (
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

    UNIQUE INDEX `LeaveEntry_docid_key`(`docid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Page` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NULL,
    `type` ENUM('Masters', 'Transactions', 'Reports', 'AdminAccess') NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `pageGroupId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InfoTerm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `branchId` INTEGER NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Article` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL,
    `selectedType` VARCHAR(191) NULL,

    UNIQUE INDEX `Article_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `gstNo` VARCHAR(191) NULL,
    `panNo` VARCHAR(191) NULL,
    `contactName` VARCHAR(191) NULL,
    `contactMobile` BIGINT NOT NULL,
    `contactEmail` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `accNo` VARCHAR(191) NULL,
    `branchName` VARCHAR(191) NULL,
    `ifscCode` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Company_companyId_key`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `validFrom` DATETIME(3) NOT NULL,
    `expireAt` DATETIME(3) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `maxUsers` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Portion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchName` VARCHAR(191) NOT NULL,
    `branchCode` VARCHAR(191) NULL,
    `contactName` VARCHAR(191) NULL,
    `contactMobile` BIGINT NOT NULL,
    `contactEmail` VARCHAR(191) NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `idPrefix` VARCHAR(191) NULL,
    `idSequence` VARCHAR(191) NULL,
    `tempPrefix` VARCHAR(191) NULL,
    `tempSequence` VARCHAR(191) NULL,
    `prefixCategory` ENUM('Default', 'Specific') NULL,
    `address` VARCHAR(191) NULL,
    `gstNo` VARCHAR(191) NULL,
    `panNo` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserOnBranch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `COMPCODE` VARCHAR(191) NOT NULL DEFAULT '',
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
    `isdefault` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAdminDet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `userAdminId` INTEGER NULL,
    `label` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPartyDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `partyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `regNo` VARCHAR(191) NOT NULL,
    `chamberNo` VARCHAR(191) NOT NULL,
    `departmentId` INTEGER NULL,
    `joiningDate` DATETIME(3) NOT NULL,
    `fatherName` VARCHAR(191) NULL,
    `dob` DATETIME(3) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `maritalStatus` ENUM('SINGLE', 'MARRIED', 'SEPARATED') NULL,
    `bloodGroup` ENUM('AP', 'BP', 'AN', 'BN', 'ABP', 'ABN', 'OP', 'ON') NULL,
    `panNo` VARCHAR(191) NULL,
    `consultFee` VARCHAR(191) NULL,
    `salaryPerMonth` VARCHAR(191) NOT NULL,
    `commissionCharges` VARCHAR(191) NULL,
    `mobile` BIGINT NULL,
    `accountNo` VARCHAR(191) NULL,
    `ifscNo` VARCHAR(191) NULL,
    `branchName` VARCHAR(191) NULL,
    `degree` VARCHAR(191) NULL,
    `specialization` VARCHAR(191) NULL,
    `localAddress` VARCHAR(191) NULL,
    `localCityId` INTEGER NOT NULL,
    `localPincode` INTEGER NULL,
    `permAddress` VARCHAR(191) NULL,
    `permCityId` INTEGER NULL,
    `permPincode` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `image` LONGBLOB NULL,
    `branchId` INTEGER NULL,
    `employeeCategoryId` INTEGER NULL,
    `permanent` BOOLEAN NOT NULL DEFAULT false,
    `leavingReason` VARCHAR(191) NULL,
    `leavingDate` DATETIME(3) NULL,
    `canRejoin` BOOLEAN NOT NULL DEFAULT true,
    `rejoinReason` VARCHAR(191) NULL,

    UNIQUE INDEX `Employee_email_key`(`email`),
    UNIQUE INDEX `Employee_regNo_key`(`regNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinYear` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from` DATETIME(3) NOT NULL,
    `to` DATETIME(3) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `defaultCategory` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Country` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commercial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processId` INTEGER NULL,
    `type` VARCHAR(191) NULL,
    `value` DOUBLE NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trimFabric` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `State` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `gstNo` VARCHAR(191) NOT NULL,
    `countryId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `City` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `code` VARCHAR(191) NOT NULL,
    `stateId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('Masters', 'Transactions', 'Reports', 'AdminAccess') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Currency` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `currency` DOUBLE NULL,
    `code` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `subCurrency` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Party` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `aliasName` VARCHAR(191) NULL,
    `displayName` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `cityId` INTEGER NULL,
    `pincode` INTEGER NULL,
    `panNo` VARCHAR(191) NULL,
    `tinNo` VARCHAR(191) NULL,
    `cstNo` VARCHAR(191) NULL,
    `cstDate` DATE NULL,
    `cinNo` VARCHAR(191) NULL,
    `faxNo` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `contactPersonName` VARCHAR(191) NULL,
    `gstNo` VARCHAR(191) NULL,
    `currencyId` INTEGER NULL,
    `costCode` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `contactMobile` BIGINT NOT NULL DEFAULT 0,
    `yarn` BOOLEAN NOT NULL DEFAULT false,
    `fabric` BOOLEAN NOT NULL DEFAULT false,
    `accessoryGroup` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `priceTemplateId` INTEGER NULL,
    `companyId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `payTermId` INTEGER NULL,
    `incoTermId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hsn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Color` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `pantone` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `isGrey` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UnitOfMeasurement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `isCutting` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayTerm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `days` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `financeCostPercent` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Process` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `io` ENUM('GY_GY', 'GY_DY', 'GY_GF', 'DY_DY', 'DY_DF', 'GF_DF', 'DF_DF') NULL,
    `isCutting` BOOLEAN NOT NULL DEFAULT false,
    `isPacking` BOOLEAN NOT NULL DEFAULT false,
    `isPcsStage` BOOLEAN NOT NULL DEFAULT false,
    `isYarn` BOOLEAN NOT NULL DEFAULT false,
    `isFabric` BOOLEAN NOT NULL DEFAULT false,
    `isTrims` BOOLEAN NOT NULL DEFAULT false,
    `isCmt` BOOLEAN NOT NULL DEFAULT false,
    `isCommercial` BOOLEAN NOT NULL DEFAULT false,
    `isPrintingAndEmb` BOOLEAN NOT NULL DEFAULT false,
    `isTransportation` BOOLEAN NOT NULL DEFAULT false,
    `isOversHeads` BOOLEAN NOT NULL DEFAULT false,
    `isFinance` BOOLEAN NOT NULL DEFAULT false,
    `isProcessLoss` BOOLEAN NOT NULL DEFAULT false,
    `isFinish` BOOLEAN NOT NULL DEFAULT false,
    `isSpecialFinish` BOOLEAN NOT NULL DEFAULT false,
    `isPurchase` BOOLEAN NOT NULL DEFAULT false,
    `isKnitting` BOOLEAN NOT NULL DEFAULT false,
    `isDyeing` BOOLEAN NOT NULL DEFAULT false,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,
    `rate` INTEGER NOT NULL DEFAULT 0,
    `loss` INTEGER NOT NULL DEFAULT 0,
    `isPrintingJobWork` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Process_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProcessGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProcessGroupDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processGroupId` INTEGER NOT NULL,
    `processId` INTEGER NOT NULL,
    `sequence` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyOnProcess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyId` INTEGER NOT NULL,
    `processId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Style` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NULL,
    `productType` VARCHAR(191) NULL,
    `seoTitle` VARCHAR(191) NULL,
    `image` LONGBLOB NULL,
    `sleeve` VARCHAR(191) NULL,
    `pattern` VARCHAR(191) NULL,
    `occasion` VARCHAR(191) NULL,
    `material` VARCHAR(191) NULL,
    `washCare` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,
    `hsn` VARCHAR(191) NULL,
    `sizeTemplateId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StyleOnColor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `styleId` INTEGER NOT NULL,
    `colorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceTemplateStyleWiseDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `styleId` INTEGER NOT NULL,
    `priceTemplateId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Size` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isAccessory` BOOLEAN NOT NULL DEFAULT false,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SizeTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SizeTemplateOnSize` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sizeTemplateId` INTEGER NOT NULL,
    `sizeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FieldMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConsumptionTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `branchId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `formula` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConsumptionTemplateDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fieldId` INTEGER NOT NULL,
    `formula` VARCHAR(191) NULL,
    `consumptionTemplateId` INTEGER NOT NULL,
    `sequence` INTEGER NULL,
    `defaultValue` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Costing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `userDocDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `adminResavedId` INTEGER NULL,
    `styleRefNo` VARCHAR(191) NULL,
    `consumptionTemplateId` INTEGER NULL,
    `partyId` INTEGER NOT NULL,
    `orderQty` VARCHAR(191) NULL,
    `targetRate` VARCHAR(191) NULL,
    `finalPrice` VARCHAR(191) NULL,
    `conversionValue` VARCHAR(191) NULL,
    `conversionValue1` VARCHAR(191) NULL,
    `sizeTemplateId` INTEGER NULL,
    `size` VARCHAR(191) NULL,
    `styleImage` LONGTEXT NULL,
    `incoTermId` INTEGER NULL,
    `branchId` INTEGER NOT NULL,
    `currencyId` INTEGER NULL,
    `fabricDesc` VARCHAR(191) NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `submitToApproval` BOOLEAN NOT NULL DEFAULT false,
    `isOrderConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `remarks` VARCHAR(191) NULL,
    `costingRemarks` VARCHAR(191) NULL,
    `ratioId` INTEGER NULL,
    `ratio` VARCHAR(191) NULL,
    `prevCostingId` INTEGER NULL,
    `garmentLossPercent` VARCHAR(191) NULL,
    `transportCostPercent` VARCHAR(191) NULL,
    `marginPercent` VARCHAR(191) NULL,
    `overHeadCost` VARCHAR(191) NULL,
    `profitOrLoss` VARCHAR(191) NULL,

    UNIQUE INDEX `Costing_prevCostingId_key`(`prevCostingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CostingAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `costingId` INTEGER NOT NULL,
    `name` VARCHAR(191) NULL,
    `filePath` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommercialCostingDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `costingId` INTEGER NOT NULL,
    `processId` INTEGER NOT NULL,
    `consumptionQty` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `rate` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CostingStyleItemDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `costingId` INTEGER NOT NULL,
    `styleId` INTEGER NOT NULL,
    `fabricId` INTEGER NULL,
    `isTrimFabric` BOOLEAN NOT NULL DEFAULT false,
    `consumption` VARCHAR(191) NULL,
    `manualConsumption` VARCHAR(191) NULL,
    `consumptionQty` VARCHAR(191) NULL,
    `trimFabricId` INTEGER NULL,
    `gsm` INTEGER NULL,
    `designId` INTEGER NULL,
    `articleId` INTEGER NULL,
    `comboId` INTEGER NULL,
    `fabricDescription` LONGTEXT NULL,
    `lengthOne` INTEGER NULL,
    `lengthTwo` INTEGER NULL,
    `lengthThree` INTEGER NULL,
    `gradeOne` INTEGER NULL,
    `gradeTwo` INTEGER NULL,
    `gradeThree` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConsumptionDetailsTemplateDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `costingStyleItemDetailsId` INTEGER NOT NULL,
    `fieldId` INTEGER NOT NULL,
    `value` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YarnCostingDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `costingStyleItemDetailsId` INTEGER NOT NULL,
    `processId` INTEGER NOT NULL,
    `articleId` INTEGER NOT NULL,
    `uomId` INTEGER NOT NULL,
    `rate` VARCHAR(191) NULL,
    `loss` VARCHAR(191) NULL,
    `gain` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FabricCostingDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `costingStyleItemDetailsId` INTEGER NOT NULL,
    `processId` INTEGER NOT NULL,
    `articleId` INTEGER NULL,
    `uomId` INTEGER NOT NULL,
    `rate` VARCHAR(191) NULL,
    `loss` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryCostingDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `costingStyleItemDetailsId` INTEGER NOT NULL,
    `processId` INTEGER NOT NULL,
    `articleId` INTEGER NOT NULL,
    `uomId` INTEGER NOT NULL,
    `consumptionQty` VARCHAR(191) NULL,
    `rate` VARCHAR(191) NULL,
    `loss` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CmtCostingDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `costingStyleItemDetailsId` INTEGER NOT NULL,
    `processId` INTEGER NOT NULL,
    `uomId` INTEGER NOT NULL,
    `consumptionQty` VARCHAR(191) NULL,
    `rate` VARCHAR(191) NULL,
    `loss` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StyleOnPortion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `portionId` INTEGER NOT NULL,
    `styleId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fabric` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL,

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
CREATE TABLE `Ratio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StyleFabricTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `styleId` INTEGER NULL,
    `fabricId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `isTrimFabric` BOOLEAN NOT NULL DEFAULT false,
    `branchId` INTEGER NOT NULL,
    `designId` INTEGER NULL,
    `finishId` INTEGER NULL,
    `specialFinishId` INTEGER NULL,
    `gsm` VARCHAR(191) NULL,

    UNIQUE INDEX `StyleFabricTemplate_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SFTYarnCostingDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processId` INTEGER NOT NULL,
    `articleId` INTEGER NOT NULL,
    `uomId` INTEGER NOT NULL,
    `rate` VARCHAR(191) NULL,
    `loss` VARCHAR(191) NULL,
    `styleFabricTemplateId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SFTFabricCostingDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processId` INTEGER NOT NULL,
    `articleId` INTEGER NULL,
    `uomId` INTEGER NOT NULL,
    `rate` VARCHAR(191) NULL,
    `loss` VARCHAR(191) NULL,
    `styleFabricTemplateId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SFTAccessoryCostingDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processId` INTEGER NOT NULL,
    `articleId` INTEGER NOT NULL,
    `uomId` INTEGER NOT NULL,
    `consumptionQty` VARCHAR(191) NULL,
    `rate` VARCHAR(191) NULL,
    `loss` VARCHAR(191) NULL,
    `styleFabricTemplateId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SFTCmtCostingDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processId` INTEGER NOT NULL,
    `uomId` INTEGER NOT NULL,
    `consumptionQty` VARCHAR(191) NULL,
    `rate` VARCHAR(191) NULL,
    `loss` VARCHAR(191) NULL,
    `styleFabricTemplateId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticleProcessPriceTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processId` INTEGER NOT NULL,
    `articleId` INTEGER NOT NULL,
    `rate` VARCHAR(191) NOT NULL,
    `loss` VARCHAR(191) NOT NULL,
    `effectiveDate` DATE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Design` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `rate` INTEGER NOT NULL DEFAULT 0,
    `loss` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Combo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `companyId` INTEGER NULL,

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
ALTER TABLE `settings` ADD CONSTRAINT `settings_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `User`(`Idcard`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`name`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `onduty` ADD CONSTRAINT `onduty_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `onduty` ADD CONSTRAINT `onduty_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `onduty` ADD CONSTRAINT `onduty_modified_By_fkey` FOREIGN KEY (`modified_By`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `onduty` ADD CONSTRAINT `onduty_category_fkey` FOREIGN KEY (`category`) REFERENCES `OndutyMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_requests` ADD CONSTRAINT `advance_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_requests` ADD CONSTRAINT `advance_requests_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_requests` ADD CONSTRAINT `advance_requests_modified_By_fkey` FOREIGN KEY (`modified_By`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_requests` ADD CONSTRAINT `advance_requests_category_fkey` FOREIGN KEY (`category`) REFERENCES `PermissionMaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanyCode` ADD CONSTRAINT `CompanyCode_Idcard_fkey` FOREIGN KEY (`Idcard`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermissionEntry` ADD CONSTRAINT `PermissionEntry_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermissionEntry` ADD CONSTRAINT `PermissionEntry_modified_By_fkey` FOREIGN KEY (`modified_By`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermissionEntry` ADD CONSTRAINT `PermissionEntry_category_fkey` FOREIGN KEY (`category`) REFERENCES `PermissionMaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermissionEntry` ADD CONSTRAINT `PermissionEntry_hod_fkey` FOREIGN KEY (`hod`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermissionEntry` ADD CONSTRAINT `PermissionEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat` ADD CONSTRAINT `chat_sender_fkey` FOREIGN KEY (`sender`) REFERENCES `User`(`Idcard`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveEntry` ADD CONSTRAINT `LeaveEntry_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveEntry` ADD CONSTRAINT `LeaveEntry_modified_By_fkey` FOREIGN KEY (`modified_By`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveEntry` ADD CONSTRAINT `LeaveEntry_hod_fkey` FOREIGN KEY (`hod`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveEntry` ADD CONSTRAINT `LeaveEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`Idcard`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveEntry` ADD CONSTRAINT `LeaveEntry_category_fkey` FOREIGN KEY (`category`) REFERENCES `PermissionMaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_pageGroupId_fkey` FOREIGN KEY (`pageGroupId`) REFERENCES `PageGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InfoTerm` ADD CONSTRAINT `InfoTerm_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InfoTerm` ADD CONSTRAINT `InfoTerm_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Portion` ADD CONSTRAINT `Portion_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Branch` ADD CONSTRAINT `Branch_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserOnBranch` ADD CONSTRAINT `UserOnBranch_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserOnBranch` ADD CONSTRAINT `UserOnBranch_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleOnPage` ADD CONSTRAINT `RoleOnPage_roleName_fkey` FOREIGN KEY (`roleName`) REFERENCES `Role`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAdminDet` ADD CONSTRAINT `UserAdminDet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAdminDet` ADD CONSTRAINT `UserAdminDet_userAdminId_fkey` FOREIGN KEY (`userAdminId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPartyDetails` ADD CONSTRAINT `UserPartyDetails_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPartyDetails` ADD CONSTRAINT `UserPartyDetails_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_localCityId_fkey` FOREIGN KEY (`localCityId`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_permCityId_fkey` FOREIGN KEY (`permCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_employeeCategoryId_fkey` FOREIGN KEY (`employeeCategoryId`) REFERENCES `EmployeeCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinYear` ADD CONSTRAINT `FinYear_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeCategory` ADD CONSTRAINT `EmployeeCategory_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Country` ADD CONSTRAINT `Country_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commercial` ADD CONSTRAINT `Commercial_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trimFabric` ADD CONSTRAINT `trimFabric_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `State` ADD CONSTRAINT `State_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `Country`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `City` ADD CONSTRAINT `City_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `State`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyCategory` ADD CONSTRAINT `PartyCategory_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Currency` ADD CONSTRAINT `Currency_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_currencyId_fkey` FOREIGN KEY (`currencyId`) REFERENCES `Currency`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_priceTemplateId_fkey` FOREIGN KEY (`priceTemplateId`) REFERENCES `PriceTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_payTermId_fkey` FOREIGN KEY (`payTermId`) REFERENCES `PayTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_incoTermId_fkey` FOREIGN KEY (`incoTermId`) REFERENCES `InfoTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Hsn` ADD CONSTRAINT `Hsn_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Color` ADD CONSTRAINT `Color_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UnitOfMeasurement` ADD CONSTRAINT `UnitOfMeasurement_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayTerm` ADD CONSTRAINT `PayTerm_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Process` ADD CONSTRAINT `Process_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessGroup` ADD CONSTRAINT `ProcessGroup_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessGroupDetails` ADD CONSTRAINT `ProcessGroupDetails_processGroupId_fkey` FOREIGN KEY (`processGroupId`) REFERENCES `ProcessGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessGroupDetails` ADD CONSTRAINT `ProcessGroupDetails_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyOnProcess` ADD CONSTRAINT `PartyOnProcess_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyOnProcess` ADD CONSTRAINT `PartyOnProcess_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleOnColor` ADD CONSTRAINT `StyleOnColor_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleOnColor` ADD CONSTRAINT `StyleOnColor_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceTemplate` ADD CONSTRAINT `PriceTemplate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceTemplateStyleWiseDetails` ADD CONSTRAINT `PriceTemplateStyleWiseDetails_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceTemplateStyleWiseDetails` ADD CONSTRAINT `PriceTemplateStyleWiseDetails_priceTemplateId_fkey` FOREIGN KEY (`priceTemplateId`) REFERENCES `PriceTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Size` ADD CONSTRAINT `Size_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SizeTemplate` ADD CONSTRAINT `SizeTemplate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SizeTemplateOnSize` ADD CONSTRAINT `SizeTemplateOnSize_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SizeTemplateOnSize` ADD CONSTRAINT `SizeTemplateOnSize_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FieldMaster` ADD CONSTRAINT `FieldMaster_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConsumptionTemplate` ADD CONSTRAINT `ConsumptionTemplate_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConsumptionTemplateDetails` ADD CONSTRAINT `ConsumptionTemplateDetails_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `FieldMaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConsumptionTemplateDetails` ADD CONSTRAINT `ConsumptionTemplateDetails_consumptionTemplateId_fkey` FOREIGN KEY (`consumptionTemplateId`) REFERENCES `ConsumptionTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Costing` ADD CONSTRAINT `Costing_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Costing` ADD CONSTRAINT `Costing_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Costing` ADD CONSTRAINT `Costing_adminResavedId_fkey` FOREIGN KEY (`adminResavedId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Costing` ADD CONSTRAINT `Costing_consumptionTemplateId_fkey` FOREIGN KEY (`consumptionTemplateId`) REFERENCES `ConsumptionTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Costing` ADD CONSTRAINT `Costing_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Costing` ADD CONSTRAINT `Costing_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Costing` ADD CONSTRAINT `Costing_incoTermId_fkey` FOREIGN KEY (`incoTermId`) REFERENCES `InfoTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Costing` ADD CONSTRAINT `Costing_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Costing` ADD CONSTRAINT `Costing_currencyId_fkey` FOREIGN KEY (`currencyId`) REFERENCES `Currency`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Costing` ADD CONSTRAINT `Costing_ratioId_fkey` FOREIGN KEY (`ratioId`) REFERENCES `Ratio`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Costing` ADD CONSTRAINT `Costing_prevCostingId_fkey` FOREIGN KEY (`prevCostingId`) REFERENCES `Costing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CostingAttachments` ADD CONSTRAINT `CostingAttachments_costingId_fkey` FOREIGN KEY (`costingId`) REFERENCES `Costing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommercialCostingDetails` ADD CONSTRAINT `CommercialCostingDetails_costingId_fkey` FOREIGN KEY (`costingId`) REFERENCES `Costing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommercialCostingDetails` ADD CONSTRAINT `CommercialCostingDetails_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CostingStyleItemDetails` ADD CONSTRAINT `CostingStyleItemDetails_costingId_fkey` FOREIGN KEY (`costingId`) REFERENCES `Costing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CostingStyleItemDetails` ADD CONSTRAINT `CostingStyleItemDetails_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CostingStyleItemDetails` ADD CONSTRAINT `CostingStyleItemDetails_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `StyleFabricTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CostingStyleItemDetails` ADD CONSTRAINT `CostingStyleItemDetails_trimFabricId_fkey` FOREIGN KEY (`trimFabricId`) REFERENCES `trimFabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CostingStyleItemDetails` ADD CONSTRAINT `CostingStyleItemDetails_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CostingStyleItemDetails` ADD CONSTRAINT `CostingStyleItemDetails_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CostingStyleItemDetails` ADD CONSTRAINT `CostingStyleItemDetails_comboId_fkey` FOREIGN KEY (`comboId`) REFERENCES `Combo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConsumptionDetailsTemplateDetails` ADD CONSTRAINT `ConsumptionDetailsTemplateDetails_costingStyleItemDetailsId_fkey` FOREIGN KEY (`costingStyleItemDetailsId`) REFERENCES `CostingStyleItemDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConsumptionDetailsTemplateDetails` ADD CONSTRAINT `ConsumptionDetailsTemplateDetails_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `FieldMaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YarnCostingDetails` ADD CONSTRAINT `YarnCostingDetails_costingStyleItemDetailsId_fkey` FOREIGN KEY (`costingStyleItemDetailsId`) REFERENCES `CostingStyleItemDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YarnCostingDetails` ADD CONSTRAINT `YarnCostingDetails_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YarnCostingDetails` ADD CONSTRAINT `YarnCostingDetails_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YarnCostingDetails` ADD CONSTRAINT `YarnCostingDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricCostingDetails` ADD CONSTRAINT `FabricCostingDetails_costingStyleItemDetailsId_fkey` FOREIGN KEY (`costingStyleItemDetailsId`) REFERENCES `CostingStyleItemDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricCostingDetails` ADD CONSTRAINT `FabricCostingDetails_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricCostingDetails` ADD CONSTRAINT `FabricCostingDetails_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricCostingDetails` ADD CONSTRAINT `FabricCostingDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCostingDetails` ADD CONSTRAINT `AccessoryCostingDetails_costingStyleItemDetailsId_fkey` FOREIGN KEY (`costingStyleItemDetailsId`) REFERENCES `CostingStyleItemDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCostingDetails` ADD CONSTRAINT `AccessoryCostingDetails_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCostingDetails` ADD CONSTRAINT `AccessoryCostingDetails_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryCostingDetails` ADD CONSTRAINT `AccessoryCostingDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmtCostingDetails` ADD CONSTRAINT `CmtCostingDetails_costingStyleItemDetailsId_fkey` FOREIGN KEY (`costingStyleItemDetailsId`) REFERENCES `CostingStyleItemDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmtCostingDetails` ADD CONSTRAINT `CmtCostingDetails_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmtCostingDetails` ADD CONSTRAINT `CmtCostingDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleOnPortion` ADD CONSTRAINT `StyleOnPortion_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleOnPortion` ADD CONSTRAINT `StyleOnPortion_portionId_fkey` FOREIGN KEY (`portionId`) REFERENCES `Portion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_costingId_fkey` FOREIGN KEY (`costingId`) REFERENCES `Costing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ratio` ADD CONSTRAINT `Ratio_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleFabricTemplate` ADD CONSTRAINT `StyleFabricTemplate_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleFabricTemplate` ADD CONSTRAINT `StyleFabricTemplate_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Article`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleFabricTemplate` ADD CONSTRAINT `StyleFabricTemplate_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Article`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleFabricTemplate` ADD CONSTRAINT `StyleFabricTemplate_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleFabricTemplate` ADD CONSTRAINT `StyleFabricTemplate_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleFabricTemplate` ADD CONSTRAINT `StyleFabricTemplate_finishId_fkey` FOREIGN KEY (`finishId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleFabricTemplate` ADD CONSTRAINT `StyleFabricTemplate_specialFinishId_fkey` FOREIGN KEY (`specialFinishId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTYarnCostingDetails` ADD CONSTRAINT `SFTYarnCostingDetails_styleFabricTemplateId_fkey` FOREIGN KEY (`styleFabricTemplateId`) REFERENCES `StyleFabricTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTYarnCostingDetails` ADD CONSTRAINT `SFTYarnCostingDetails_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTYarnCostingDetails` ADD CONSTRAINT `SFTYarnCostingDetails_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTYarnCostingDetails` ADD CONSTRAINT `SFTYarnCostingDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTFabricCostingDetails` ADD CONSTRAINT `SFTFabricCostingDetails_styleFabricTemplateId_fkey` FOREIGN KEY (`styleFabricTemplateId`) REFERENCES `StyleFabricTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTFabricCostingDetails` ADD CONSTRAINT `SFTFabricCostingDetails_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTFabricCostingDetails` ADD CONSTRAINT `SFTFabricCostingDetails_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTFabricCostingDetails` ADD CONSTRAINT `SFTFabricCostingDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTAccessoryCostingDetails` ADD CONSTRAINT `SFTAccessoryCostingDetails_styleFabricTemplateId_fkey` FOREIGN KEY (`styleFabricTemplateId`) REFERENCES `StyleFabricTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTAccessoryCostingDetails` ADD CONSTRAINT `SFTAccessoryCostingDetails_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTAccessoryCostingDetails` ADD CONSTRAINT `SFTAccessoryCostingDetails_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTAccessoryCostingDetails` ADD CONSTRAINT `SFTAccessoryCostingDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTCmtCostingDetails` ADD CONSTRAINT `SFTCmtCostingDetails_styleFabricTemplateId_fkey` FOREIGN KEY (`styleFabricTemplateId`) REFERENCES `StyleFabricTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTCmtCostingDetails` ADD CONSTRAINT `SFTCmtCostingDetails_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SFTCmtCostingDetails` ADD CONSTRAINT `SFTCmtCostingDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleProcessPriceTemplate` ADD CONSTRAINT `ArticleProcessPriceTemplate_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleProcessPriceTemplate` ADD CONSTRAINT `ArticleProcessPriceTemplate_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Design` ADD CONSTRAINT `Design_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Combo` ADD CONSTRAINT `Combo_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NotifyApprovalGroupToUser` ADD CONSTRAINT `_NotifyApprovalGroupToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `NotifyApprovalGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NotifyApprovalGroupToUser` ADD CONSTRAINT `_NotifyApprovalGroupToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionEntryToUser` ADD CONSTRAINT `_PermissionEntryToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `PermissionEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionEntryToUser` ADD CONSTRAINT `_PermissionEntryToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
