-- Migration: Remove Referral System
-- This migration removes all referral-related columns and tables from the database

-- Remove referral columns from users table
ALTER TABLE users 
DROP COLUMN IF EXISTS referral_code,
DROP COLUMN IF EXISTS referred_by;

-- Drop referrals table if it exists
DROP TABLE IF EXISTS referrals CASCADE;

-- Update any views or functions that referenced these columns
-- (Add specific updates here if you have views/functions using referral data)
