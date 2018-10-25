const RedshiftAuthorizer = require('../dist/redshiftAuthorizer')
const prefix = process.env.NODE_ENV || 'production'

for (let index = 0; index < 3; index++) {
  const db = RedshiftAuthorizer.getDbConnection(`/${prefix}/redshift`)
    .then(db => {
      console.log(db.$pool.options.password)
      let res = typeof db.connect === 'function'
        ? 'Passed!' : 'Failed! '

        db.any('SELECT * FROM users LIMIT 1', [true])
          .then(function (data) {
            // Success
            console.log('data successfully retrieved')
          })
          .catch(function(err) {
            // Uh oh...
            console.error(err)
          })
      // console.log(res)
    })
  }

;(async function () {
  for (let index = 0; index < 10; index++) {
    await RedshiftAuthorizer.getDbConnection(`/${prefix}/redshift`).then(db => {
      console.log(`temp password: ${db.$pool.options.password}`)
    })
  }
})()

