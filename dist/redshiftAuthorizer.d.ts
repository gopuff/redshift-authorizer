import { IDatabase } from "pg-promise";
import { QueryFile } from "pg-promise";
/**
 * Returns a promise for a pg-promise connection
 * @param paramPath String - the path for the params
 */
declare function getDbConnection(paramPath: string): Promise<IDatabase<PromiseLike<never>> & PromiseLike<never>>;
declare function getQueryFile(filename: string): QueryFile;
export { getDbConnection, getQueryFile };
