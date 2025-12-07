-- Migration: Add Profile Creation Fields to User Table
-- This migration documents the schema changes for the profile creation feature
-- Note: With synchronize: true, these changes are applied automatically

-- Add new enum types
CREATE TYPE "user_role_enum" AS ENUM('admin', 'user', 'moderator');
CREATE TYPE "user_clienttype_enum" AS ENUM('JEWELRY_ECOMMERCE', 'MANUFACTURER_WHOLESALER', 'DESIGNER_ETSY', 'MARKETING_AGENCY');
CREATE TYPE "user_primaryservice_enum" AS ENUM('CAD_MODELING', 'PHOTOREALISTIC_RENDERING', 'ANIMATION_VIDEO', 'CONSULTING');
CREATE TYPE "user_projectvolume_enum" AS ENUM('ONE_OFF', 'ONE_TO_FIVE_MONTHLY', 'FIVE_PLUS_VOLUME', 'ONGOING_RETAINER');
CREATE TYPE "user_cadsoftware_enum" AS ENUM('RHINO', 'MATRIX_GOLD', 'ZBRUSH', 'OTHER');
CREATE TYPE "user_requiredoutput_enum" AS ENUM('STL', 'CDM', 'PNG_JPEG', 'MP4');

-- Add profile creation fields to user table
ALTER TABLE "user"
ADD COLUMN "fullName" varchar,
ADD COLUMN "companyName" varchar,
ADD COLUMN "clientType" "user_clienttype_enum",
ADD COLUMN "primaryService" text[],
ADD COLUMN "projectVolume" "user_projectvolume_enum",
ADD COLUMN "cadSoftware" "user_cadsoftware_enum",
ADD COLUMN "requiredOutputs" text[],
ADD COLUMN "referralSource" varchar,
ADD COLUMN "isProfileComplete" boolean NOT NULL DEFAULT false,
ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create trigger for updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE
    ON "user" FOR EACH ROW EXECUTE PROCEDURE
    update_updated_at_column();
