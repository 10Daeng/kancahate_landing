CREATE TABLE "accounts" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verificationTokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationTokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "banned_at" timestamp;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "otp_code" varchar(10);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "otp_expires" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_password_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_password_expires" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_reports" DROP COLUMN "perp_name";--> statement-breakpoint
ALTER TABLE "incident_reports" DROP COLUMN "perp_class";--> statement-breakpoint
ALTER TABLE "incident_reports" DROP COLUMN "perp_description";--> statement-breakpoint
ALTER TABLE "incident_reports" DROP COLUMN "victim_name";--> statement-breakpoint
ALTER TABLE "incident_reports" DROP COLUMN "victim_class";--> statement-breakpoint
ALTER TABLE "incident_reports" DROP COLUMN "victim_relation";