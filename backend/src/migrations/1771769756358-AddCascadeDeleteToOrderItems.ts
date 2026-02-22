import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeDeleteToOrderItems1771769756358 implements MigrationInterface {
    name = 'AddCascadeDeleteToOrderItems1771769756358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cc_order_items" DROP CONSTRAINT "FK_93829f82a8911f9e59b50b85e29"`);
        await queryRunner.query(`ALTER TABLE "cc_order_items" ADD CONSTRAINT "FK_93829f82a8911f9e59b50b85e29" FOREIGN KEY ("order_id") REFERENCES "cc_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cc_order_items" DROP CONSTRAINT "FK_93829f82a8911f9e59b50b85e29"`);
        await queryRunner.query(`ALTER TABLE "cc_order_items" ADD CONSTRAINT "FK_93829f82a8911f9e59b50b85e29" FOREIGN KEY ("order_id") REFERENCES "cc_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
