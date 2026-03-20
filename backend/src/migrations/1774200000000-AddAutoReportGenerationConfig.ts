import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAutoReportGenerationConfig1774200000000 implements MigrationInterface {
    name = 'AddAutoReportGenerationConfig1774200000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "whatsapp_config" ADD "auto_report_generation_enabled" boolean NOT NULL DEFAULT true`,
        );
        await queryRunner.query(
            `ALTER TABLE "whatsapp_config" ADD "auto_report_generation_time" character varying NOT NULL DEFAULT '00:00'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "whatsapp_config" DROP COLUMN "auto_report_generation_time"`,
        );
        await queryRunner.query(
            `ALTER TABLE "whatsapp_config" DROP COLUMN "auto_report_generation_enabled"`,
        );
    }
}
