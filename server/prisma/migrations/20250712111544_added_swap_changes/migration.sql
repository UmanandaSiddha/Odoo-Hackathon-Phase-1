/*
  Warnings:

  - The values [REJECTED] on the enum `SwapRequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `content` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `description` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SWAP', 'MESSAGE', 'SYSTEM', 'REVIEW');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- AlterEnum
BEGIN;
CREATE TYPE "SwapRequestStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "SwapRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SwapRequest" ALTER COLUMN "status" TYPE "SwapRequestStatus_new" USING ("status"::text::"SwapRequestStatus_new");
ALTER TYPE "SwapRequestStatus" RENAME TO "SwapRequestStatus_old";
ALTER TYPE "SwapRequestStatus_new" RENAME TO "SwapRequestStatus";
DROP TYPE "SwapRequestStatus_old";
ALTER TABLE "SwapRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "swapRequestId" TEXT;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "content",
ADD COLUMN     "actionUrl" TEXT,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" "NotificationType" NOT NULL,
ALTER COLUMN "metadata" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SwapRequest" ADD COLUMN     "duration" INTEGER DEFAULT 1,
ADD COLUMN     "lastActivity" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE INDEX "Chat_swapRequestId_idx" ON "Chat"("swapRequestId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_created_at_idx" ON "Notification"("created_at");

-- CreateIndex
CREATE INDEX "SwapRequest_senderId_idx" ON "SwapRequest"("senderId");

-- CreateIndex
CREATE INDEX "SwapRequest_receiverId_idx" ON "SwapRequest"("receiverId");

-- CreateIndex
CREATE INDEX "SwapRequest_status_idx" ON "SwapRequest"("status");

-- CreateIndex
CREATE INDEX "SwapRequest_created_at_idx" ON "SwapRequest"("created_at");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_swapRequestId_fkey" FOREIGN KEY ("swapRequestId") REFERENCES "SwapRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
