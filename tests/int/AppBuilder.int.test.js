const AppBuilder = require('../../src/AppBuilder')

// todo: delete /ssl/cert.pem and /ssl/key.pem
// before the beggining

test('Method .certificate works', async () => {
  const builder = new AppBuilder()

  await builder
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
})

// todo: write a tests for method .run
