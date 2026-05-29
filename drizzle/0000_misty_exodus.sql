CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"email" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'admin',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"category" varchar(100),
	"cover_image" text,
	"status" varchar(50) DEFAULT 'draft',
	"author_id" uuid,
	"author_name" varchar(255),
	"view_count" integer DEFAULT 0,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "assessment_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"anon_user_id" varchar(255),
	"email" varchar(255),
	"assessment_type" varchar(100),
	"assessment_name" varchar(255),
	"score" integer,
	"max_score" integer,
	"severity" varchar(100),
	"result_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "counseling_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(255),
	"user_id" uuid,
	"anon_user_id" varchar(255),
	"user_email" varchar(255),
	"user_name" varchar(255),
	"category" varchar(100),
	"subtopic" varchar(255),
	"subtopic_custom" boolean DEFAULT false,
	"persona_id" varchar(100),
	"risk_level" varchar(50),
	"risk_priority" integer DEFAULT 1,
	"chat_history" jsonb DEFAULT '[]'::jsonb,
	"message_count" integer DEFAULT 0,
	"user_message_count" integer DEFAULT 0,
	"summary" text,
	"detected_keywords" text,
	"started_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"status" varchar(50) DEFAULT 'In Progress',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "counseling_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "counseling_sessions_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(255),
	"user_id" uuid,
	"anon_user_id" varchar(255),
	"session_data" jsonb,
	"last_saved_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "incident_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" uuid,
	"reporter_name" varchar(255),
	"reporter_status" varchar(100),
	"reporter_phone" varchar(50),
	"reporter_email" varchar(255),
	"is_anonymous" boolean DEFAULT false,
	"perpetrators" jsonb,
	"perp_name" varchar(255),
	"perp_class" varchar(100),
	"perp_description" text,
	"victims" jsonb,
	"victim_name" varchar(255),
	"victim_class" varchar(100),
	"victim_relation" varchar(100),
	"incident_type" varchar(100),
	"bullying_types" jsonb,
	"location" varchar(255),
	"incident_date" timestamp,
	"incident_time" varchar(50),
	"chronology" text,
	"witnesses" jsonb,
	"evidence" jsonb,
	"initial_actions" text,
	"reported_to_counselor" boolean DEFAULT false,
	"values_violated" jsonb,
	"severity" varchar(50) DEFAULT 'sedang',
	"status" varchar(50) DEFAULT 'pending',
	"admin_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"email" varchar(255),
	"name" varchar(255),
	"gender" varchar(50),
	"dob" timestamp,
	"age" integer,
	"education_status" varchar(100),
	"institution_type" varchar(100),
	"occupation" varchar(100),
	"location" varchar(255),
	"location_custom" varchar(255),
	"bio" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"password_hash" varchar(255),
	"role" varchar(50) DEFAULT 'user',
	"is_active" boolean DEFAULT true,
	"email_verified" timestamp,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;