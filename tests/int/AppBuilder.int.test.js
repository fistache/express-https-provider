const AppBuilder = require('../../src/AppBuilder')

const del = require('del')
const path = require('path')

const clearCache = () => {
  del.sync([path.join(__dirname, '../../ssl/*.pem')])
}

describe('Method .certificate', () => {
  const validateCertificate = async () => {
    await new AppBuilder()
      .modifyApp(app => {
        app.use('*', (request, response) => {
          response.send('test')
        })
      })
      .certificate()
      .then(certificate => {
        expect(certificate).toBeTruthy()
        expect(typeof certificate).toBe('object')
        expect(typeof certificate.cert).toBe('string')
        expect(typeof certificate.key).toBe('string')
        expect(certificate.cert.length).toBeGreaterThan(50)
        expect(certificate.key.length).toBeGreaterThan(50)
      })
  }

  test('works with no cache', async () => {
    clearCache()
    await validateCertificate()
  })

  test('works with cache', async () => {
    clearCache()
    // gen cache
    await validateCertificate()
    // test cache
    await validateCertificate()
  })
})

describe('Method .run', () => {
  const isServerRunnedSuccessfully = () => {
    return new Promise((resolve, reject) => {
      new AppBuilder()
        .modifyApp(app => {
          app.use('*', (request, response) => {
            response.send('test')
          })
        })
        .done((http, https, state) => {
          expect(http).toBeTruthy()
          expect(https).toBeTruthy()
          expect(state).toBeTruthy()

          const link = state.getServingLink()
          expect(typeof link).toBe('string')
          resolve()
        })
        .run()
        .catch(error => reject(error))
    })
  }

  test('works with no cache', async () => {
    clearCache()
    await isServerRunnedSuccessfully()
  })

  test('works with cache', async () => {
    clearCache()
    // gen cache
    await isServerRunnedSuccessfully()
    // test cache
    await isServerRunnedSuccessfully()
  })
})
