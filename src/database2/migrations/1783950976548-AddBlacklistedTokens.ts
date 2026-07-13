import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlacklistedTokens1783950976548 implements MigrationInterface {
    name = 'AddBlacklistedTokens1783950976548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "blacklisted_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "jti" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_8fb1bc7333c3b9f249f9feaa55d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1be9ab854764a00c6a3e3ee910" ON "blacklisted_tokens"  ("jti") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_1be9ab854764a00c6a3e3ee910"`);
        await queryRunner.query(`DROP TABLE "blacklisted_tokens"`);
    }

}
