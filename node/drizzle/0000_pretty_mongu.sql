CREATE TABLE IF NOT EXISTS "requests" (
	"id" serial NOT NULL,
	"created_at" timestamp,
	"requestId" text,
	"jobid" text,
	"jobArgs" text,
	"requesterAddress" text
);
