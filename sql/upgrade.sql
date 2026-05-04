-- =========================
-- MIGRATION: Add created_at column to Books table
-- =========================
-- This script adds the created_at datetime field to an existing Books table
-- Run this if you already have a database with the Books table
 
-- Add the created_at column with default value of CURRENT_TIMESTAMP
ALTER TABLE Books ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
 
-- Optional: Update existing records to set created_at to current time
UPDATE Books SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL