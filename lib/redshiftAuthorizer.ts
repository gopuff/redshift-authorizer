import * as AWS from "aws-sdk";
AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1"
});

import * as fs from "fs";
import { IDatabase, IMain } from "pg-promise";
import * as pgPromise from "pg-promise";
import { QueryFile } from "pg-promise";

const pgp: IMain = pgPromise();
const ssm = new AWS.SSM();
const redshift = new AWS.Redshift();

// Allow IAM to create a Redshift user if it doesn't already exist
const ALLOW_CREATE = Boolean(process.env.ALLOW_CREATE || false);
// Enable/disable debugging if ALLOW_DEBUG env var is defined, or allow it if NODE_ENV is dev
const ALLOW_DEBUG = Boolean(
  process.env.ALLOW_DEBUG || process.env.NODE_ENV === "dev" ? true : false
);

// Cache for PG Promise queryFile
const queryFileCache = {};

function getPw(cn) {
  return new Promise((resolve, reject) => {
    redshift.getClusterCredentials(
      {
        AutoCreate: ALLOW_CREATE,
        ClusterIdentifier: cn.clusterName,
        DbName: cn.dbName,
        DbUser: cn.user,
        DurationSeconds: 3600
      },
      (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  }).then((creds: AWS.Redshift.ClusterCredentials) => {
    (cn.user = creds.DbUser), (cn.password = creds.DbPassword);
    cn.expire = new Date(creds.Expiration.getTime() - 1000 * 60);
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
    user: extractParam("dataUser")
  };
  return getPw(cn);

  function extractParam(key) {
    return p.Parameters.filter(x => x.Name.endsWith(key))[0].Value;
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

const cache = {};
/**
 * Returns a promise for a pg-promise connection
 * @param paramPath String - the path for the params
 */
function getDbConnection(paramPath: string) {
  if (cache[paramPath] && cache[paramPath].cn.expire > new Date()) {
    return Promise.resolve(cache[paramPath].db);
  }
  return getDbSettings(paramPath).then(cn => {
    cache[paramPath] = {
      db: pgp(cn),
      cn
    };
    return cache[paramPath].db;
  });
}

function getQueryFile(filename: string): QueryFile {
  const params = { minify: true, debug: ALLOW_DEBUG };
  if (fs.existsSync(filename)) {
    queryFileCache[filename] =
      typeof queryFileCache[filename] === "undefined"
        ? new pgp.QueryFile(filename, params)
        : queryFileCache[filename];
    return queryFileCache[filename];
  } else {
    throw new Error(`file ${filename} does not exist`);
  }
}

export { getDbConnection, getQueryFile };
