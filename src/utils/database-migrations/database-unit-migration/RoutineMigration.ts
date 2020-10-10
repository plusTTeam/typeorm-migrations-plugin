import {
  DatabaseUnitMigration,
  MigrationFunctions,
} from "@/utils/database-migrations/interfaces";

export default class RoutineMigration implements DatabaseUnitMigration {
  downSqls: string[] = [];
  upSqls: string[] = [];
  migrationFunctions: MigrationFunctions;

  constructor(migrationFunctions: MigrationFunctions) {
    this.migrationFunctions = migrationFunctions;
  }

  async build(): Promise<void> {
    const { up, down } = this.migrationFunctions;
    up.beforeCreated && this.upSqls.push(...up.beforeCreated);

    this.upSqls.push(up.create);
    this.downSqls.push(down.drop);

    up.beforeCreated && this.upSqls.push(up.afterCreated);
    down.afterDrop && this.downSqls.push(down.afterDrop);
  }
}
