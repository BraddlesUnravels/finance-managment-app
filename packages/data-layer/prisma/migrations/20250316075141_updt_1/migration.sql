/*
  Warnings:

  - You are about to drop the column `lastUpdatedAt` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdatedBy` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdatedAt` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdatedBy` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdatedAt` on the `Income` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdatedBy` on the `Income` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `BankAccount` DROP COLUMN `lastUpdatedAt`,
    DROP COLUMN `lastUpdatedBy`;

-- AlterTable
ALTER TABLE `Expense` DROP COLUMN `lastUpdatedAt`,
    DROP COLUMN `lastUpdatedBy`;

-- AlterTable
ALTER TABLE `Income` DROP COLUMN `lastUpdatedAt`,
    DROP COLUMN `lastUpdatedBy`;
