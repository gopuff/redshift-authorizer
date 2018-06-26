const RedshiftAuthorizer = require('../dist/redshiftAuthorizer')
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
        .catch(function(err) {
          // Uh oh...
          console.error(err)
        })
    console.log(res)
  })
