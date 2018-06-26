# Redshift Authorizer

## Overview
This package utilizes [AWS SSM Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-paramstore.html) and IAM to retrieve [temporary and secure Redshift credentials](https://docs.aws.amazon.com/redshift/latest/mgmt/generating-user-credentials.html).

## Requirements

* An AWS IAM role with permission to call the GetClusterCredentials action
   * [https://docs.aws.amazon.com/redshift/latest/mgmt/generating-user-credentials.html](https://docs.aws.amazon.com/redshift/latest/mgmt/generating-user-credentials.html)
* Redshift connection information (minus a password) stored in SSM Parameter Store
