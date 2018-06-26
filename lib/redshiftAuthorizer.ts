import * as AWS from "aws-sdk";
AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1",
});

import { IDatabase, IMain } from "pg-promise";
import * as pgPromise from "pg-promise";
import { QueryFile } from "pg-promise";
import { join } from "path";

const pgp: IMain = pgPromise();

const ssm = new AWS.SSM();
const redshift = new AWS.Redshift();
const allowAutoCreate = Boolean(process.env.ALLOW_CREATE || false);

function getPw(cn) {
  return new Promise((resolve, reject) => {
    redshift.getClusterCredentials(
      {
        AutoCreate: allowAutoCreate,
        ClusterIdentifier: cn.clusterName,
        DbName: cn.dbName,
        DbUser: cn.user,
        DurationSeconds: 900,
      },
      (err, data) => {
        if (err) { reject(err); }
        resolve(data);
      },
    );
  }).then((creds: AWS.Redshift.ClusterCredentials) => {
    (cn.user = creds.DbUser), (cn.password = creds.DbPassword);
    return cn;
  });
}

/**
 * return a connection object for pg-promise
 * @param p AWS.Ssm.GetParametersByPathResult
 */
function buildCn(p) {
  const cn = {
    clusterName: extractParam("clusterName"),
    database: extractParam("dbName"),
    host: extractParam("host"),
    password: null,
    port: extractParam("port"),
    ssl: "require",
    user: extractParam("dataUser"),
  };
  return getPw(cn);

  function extractParam(key) {
    return p.Parameters.filter((x) => x.Name.endsWith(key))[0].Value;
  }
}

function getDbSettings(paramPath: string) {
  const params: AWS.SSM.Types.GetParametersByPathRequest = {
    MaxResults: 10,
    Path: paramPath,
    Recursive: true,
    WithDecryption: false,
  };
  return ssm
    .getParametersByPath(params)
    .promise()
    .then(buildCn);
}

/**
 * Returns a promise for a pg-promise connection
 * @param paramPath String - the path for the params
 */
function getDbConnection(paramPath: string) {
  return getDbSettings(paramPath).then((cn) => {
    return pgp(cn)
  });
}

let queryFileCache = {}

function getQueryFile(filename :string): QueryFile {
  let params = {minify: true, debug: true}
  queryFileCache[filename] = typeof queryFileCache[filename] === "undefined"
    ? new pgp.QueryFile(join(__dirname, "..", "sql", filename), params)
    : queryFileCache[filename]

  return queryFileCache[filename]
}

export {
  getDbConnection,
  getQueryFile,
};