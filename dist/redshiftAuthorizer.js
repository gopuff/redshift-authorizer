"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
AWS.config.update({
    region: process.env.AWS_REGION || "us-east-1",
});
const pgPromise = require("pg-promise");
const path_1 = require("path");
const pgp = pgPromise();
const ssm = new AWS.SSM();
const redshift = new AWS.Redshift();
const allowAutoCreate = Boolean(process.env.ALLOW_CREATE || false);
function getPw(cn) {
    return new Promise((resolve, reject) => {
        redshift.getClusterCredentials({
            AutoCreate: allowAutoCreate,
            ClusterIdentifier: cn.clusterName,
            DbName: cn.dbName,
            DbUser: cn.user,
            DurationSeconds: 900,
        }, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    }).then((creds) => {
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
function getDbSettings(paramPath) {
    const params = {
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
function getDbConnection(paramPath) {
    return getDbSettings(paramPath).then((cn) => {
        return pgp(cn);
    });
}
exports.getDbConnection = getDbConnection;
let queryFileCache = {};
function getQueryFile(filename) {
    let params = { minify: true, debug: true };
    queryFileCache[filename] = typeof queryFileCache[filename] === "undefined"
        ? new pgp.QueryFile(path_1.join(__dirname, "..", "sql", filename), params)
        : queryFileCache[filename];
    return queryFileCache[filename];
}
exports.getQueryFile = getQueryFile;
//# sourceMappingURL=redshiftAuthorizer.js.map