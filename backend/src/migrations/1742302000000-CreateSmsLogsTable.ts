import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSmsLogsTable1742302000000 implements MigrationInterface {
  name = 'CreateSmsLogsTable1742302000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."cc_sms_logs_status_enum" AS ENUM('SENT', 'FAILED')
    `);
    await queryRunner.query(`
      CREATE TABLE "cc_sms_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "phone" character varying NOT NULL,
        "message" text NOT NULL,
        "status" "public"."cc_sms_logs_status_enum" NOT NULL DEFAULT 'SENT',
        "error" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cc_sms_logs" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "cc_sms_logs"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."cc_sms_logs_status_enum"`);
  }
}
