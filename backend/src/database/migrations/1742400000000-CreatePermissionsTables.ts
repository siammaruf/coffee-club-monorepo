import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePermissionsTables1742400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create role enum type
    await queryRunner.query(`
      CREATE TYPE "public"."cc_role_permissions_role_enum" AS ENUM(
        'admin', 'manager', 'stuff', 'barista', 'chef'
      )
    `);

    // Create cc_permissions table
    await queryRunner.query(`
      CREATE TABLE "cc_permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "resource" character varying NOT NULL,
        "action" character varying NOT NULL,
        "description" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_cc_permissions_name" UNIQUE ("name"),
        CONSTRAINT "PK_cc_permissions" PRIMARY KEY ("id")
      )
    `);

    // Create cc_role_permissions table
    await queryRunner.query(`
      CREATE TABLE "cc_role_permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "role" "public"."cc_role_permissions_role_enum" NOT NULL,
        "permission_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cc_role_permissions" PRIMARY KEY ("id")
      )
    `);

    // Add unique index on (role, permission_id)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_cc_role_permissions_role_permission"
      ON "cc_role_permissions" ("role", "permission_id")
    `);

    // Add foreign key from cc_role_permissions.permission_id -> cc_permissions.id
    await queryRunner.query(`
      ALTER TABLE "cc_role_permissions"
      ADD CONSTRAINT "FK_cc_role_permissions_permission"
      FOREIGN KEY ("permission_id")
      REFERENCES "cc_permissions"("id")
      ON DELETE CASCADE
    `);

    // Create cc_audit_logs table
    await queryRunner.query(`
      CREATE TABLE "cc_audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "actor_id" character varying NOT NULL,
        "actor_role" character varying NOT NULL,
        "action" character varying NOT NULL,
        "payload" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cc_audit_logs" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cc_role_permissions" DROP CONSTRAINT "FK_cc_role_permissions_permission"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cc_role_permissions_role_permission"`);
    await queryRunner.query(`DROP TABLE "cc_audit_logs"`);
    await queryRunner.query(`DROP TABLE "cc_role_permissions"`);
    await queryRunner.query(`DROP TABLE "cc_permissions"`);
    await queryRunner.query(`DROP TYPE "public"."cc_role_permissions_role_enum"`);
  }
}
