const RedshiftAuthorizer = require('../dist/redshiftAuthorizer')
const prefix = process.env.NODE_ENV || 'production'

const rsAuth = RedshiftAuthorizer.getDbConnection(`/${prefix}/redshift`)
  .then(rsAuth => {
    let res = typeof rsAuth.connect === 'function'
      ? 'Passed!'
      : 'Failed!'

    console.log(res)
  })
