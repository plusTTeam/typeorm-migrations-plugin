import {MigrationInterface, QueryRunner} from "typeorm";
   import migrationStructure from "src/routines/functions/augrade_total";
    export class augrade_total1599173186796 implements MigrationInterface {
        public async up(queryRunner: QueryRunner): Promise<void> {
          
    if (typeof migrationStructure.up !== "string") {
      await queryRunner.query(migrationStructure.up.create);
      await queryRunner.query(migrationStructure.up.afterCreated);
    } 

        }
        public async down(queryRunner: QueryRunner): Promise<void> {
          
    await queryRunner.query(migrationStructure.down);

        }
    }