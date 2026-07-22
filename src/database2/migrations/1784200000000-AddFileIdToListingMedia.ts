import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileIdToListingMedia1784200000000 implements MigrationInterface {
    name = 'AddFileIdToListingMedia1784200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listing_media" ADD "fileId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listing_media" DROP COLUMN "fileId"`);
    }
}
