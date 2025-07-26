ALTER TABLE "feeds" DROP CONSTRAINT "feeds_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "feeds" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "feeds" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "feeds" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "feeds" ADD CONSTRAINT "feeds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;