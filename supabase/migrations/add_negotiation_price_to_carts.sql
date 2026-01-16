-- Migration: Add negotiation_price column to carts table
-- This allows storing the negotiated price offered by the buyer
-- Created: 2026-01-16

ALTER TABLE carts ADD COLUMN negotiation_price integer;

-- Add comment to clarify the column purpose
COMMENT ON COLUMN carts.negotiation_price IS 'The negotiated price offered by the buyer, in INR. NULL if no negotiation was made.';
