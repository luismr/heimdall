import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialUserTable1750348215596 implements MigrationInterface {
    name = 'InitialUserTable1750348215596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("username" character varying NOT NULL, "passwordHash" character varying NOT NULL, "roles" text array NOT NULL, "blocked" boolean NOT NULL, "refreshTokens" text array NOT NULL, CONSTRAINT "PK_fe0bb3f6520ee0469504521e710" PRIMARY KEY ("username"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
