import {
  AfterCreatedFunction,
  MigrationFunctions,
  RoutineOptions,
  DatabaseColumn,
} from "./interfaces";
import * as CONFIG from "migrationsconfig";
import { grantAccessToRoutine } from "./utils";
import { PostgresUtils } from "./PostgresUtils";

export class Routine {
  options: RoutineOptions;
  parameters: string;
  expression: string;

  buildParameters() {
    return this.options.parameters
      .map(
        (parameter: DatabaseColumn) =>
          `${parameter.name}  ${PostgresUtils.createFullType(
            parameter.type,
            parameter.options
          )}`
      )
      .join(", ");
  }

  buildExpression() {
    const { schema, routineName } = this.options;
    return this.options.expression({
      schema,
      routineName,
      parameters: this.parameters,
    });
  }

  constructor(options: RoutineOptions) {
    this.setOptions(options);
    this.parameters = this.buildParameters();
    this.expression = this.buildExpression();
  }

  setOptions(options: RoutineOptions) {
    const defaultOptions = {
      parameters: [],
      afterCreated: [],
      schema: CONFIG.DB_SCHEMA,
      grantAccessToDefaultUsers: true,
    };
    this.options = Object.assign({}, defaultOptions, options);
    if (this.options.grantAccessToDefaultUsers) {
      this.options.afterCreated.push({
        callback: grantAccessToRoutine,
        params: CONFIG.DB_USERS,
      });
    }
  }

  /**
   * Construct the query to set the check_function_bodies option in database.
   * @param check boolean to activate or deactivate the option.
   * @return The SET check_function_bodies query.
   */
  checkFunctionBodies(check: boolean): string {
    return `SET check_function_bodies = ${check};`;
  }

  getCreateStatement(): string {
    return `CREATE OR REPLACE ${this.expression}`;
  }

  getName(): string {
    return this.options.routineName;
  }
  /**
   * Construct the migration functions (up and down) with the queries to create and drop the routine.
   * In the beforeCreated, disable the check function body option to create the function.
   * Construct the afterCreated field with applying the array of functions.
   * @return The migration function object of the routine.
   */
  queryConstructor(): MigrationFunctions {
    return {
      up: {
        beforeCreated: [this.checkFunctionBodies(false)],
        create: this.getCreateStatement(),
        afterCreated: this.options.afterCreated
          .map((option: AfterCreatedFunction) =>
            option.callback(this, option.params)
          )
          .join("\n"),
      },
      down: {
        drop: `DROP ${this.options.routineType.toUpperCase()} IF EXISTS ${
          this.options.routineName
        };`,
      },
    };
  }
}
