CREATE TYPE "public"."bank_account_type" AS ENUM('checking', 'savings', 'digital_wallet');--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD COLUMN "bank" text;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD COLUMN "type" "bank_account_type" DEFAULT 'checking' NOT NULL;