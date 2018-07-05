# Redshift Authorizer

## Overview
This package utilizes [AWS SSM Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-paramstore.html) and federated authentication to Redshift via IAM to retrieve [temporary and secure Redshift credentials](https://docs.aws.amazon.com/redshift/latest/mgmt/generating-user-credentials.html). It then initiates a connection to Redshift using the [pg-promise library](https://www.npmjs.com/package/pg-promise).

## Requirements

* An AWS IAM role with permission to call the [GetClusterCredentials](https://docs.aws.amazon.com/redshift/latest/APIReference/API_GetClusterCredentials.html) action
   * [https://docs.aws.amazon.com/redshift/latest/mgmt/generating-user-credentials.html](https://docs.aws.amazon.com/redshift/latest/mgmt/generating-user-credentials.html)
* Redshift connection information (minus a password) stored in SSM Parameter Store
	* [https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-paramstore-cli.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-paramstore-cli.html)

## Usage

```javascript
const RedshiftAuthorizer = require('redshift-authorizer')

// Following suggested convention, prefix environment to your parameter names
const prefix = process.env.NODE_ENV || 'production'

const db = RedshiftAuthorizer.getDbConnection(`/${prefix}/redshift`)
.then(db => {
  let res = typeof db.connect === 'function'
    ? 'Passed!' : 'Failed!'

  db.any('SELECT * FROM users LIMIT 1', [true])
    .then(function (data) {
      // Success
      console.log('data successfully retrieved')
    })
    .catch(function (err) {
      // Uh oh...
      console.error(err)
	  })
  console.log(res)
})

```

## Resources

* [Federated Redshift User Authentication](https://aws.amazon.com/blogs/big-data/federate-database-user-authentication-easily-with-iam-and-amazon-redshift/)
* [AWS Param Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-paramstore.html)
* [GetClusterCredentials](https://docs.aws.amazon.com/redshift/latest/APIReference/API_GetClusterCredentials.html)

## Contributors

* [Aaron Held](https://github.com/aheld)
* [Bobby Kozora](https://github.com/bkozora)


![goPuff](https://s3.amazonaws.com/gopuff-content/assets/images/goPuff-logo.png "Logo Title Text 1")
