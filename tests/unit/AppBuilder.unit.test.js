const AppBuilder = require('../../src/AppBuilder')

test('Method .modifyApp stores a callback', () => {
  const builder = new AppBuilder()
  const callback = app => {
  }
  builder.modifyApp(callback)

  expect(builder.callbacks).toEqual({modifyApp: [callback]})
})

test('Method .modifyRedirect stores a callback', () => {
  const builder = new AppBuilder()
  const callback = app => {
  }
  builder.modifyRedirect(callback)

  expect(builder.callbacks).toEqual({modifyRedirect: [callback]})
})

test('Method .done stores a callback', () => {
  const builder = new AppBuilder()
  const callback = app => {
  }
  builder.done(callback)

  expect(builder.callbacks).toEqual({done: [callback]})
})

test('Method .disableRedirectToHttps is tracked', () => {
  const builder = new AppBuilder()
  builder.disableRedirectToHttps()

  expect(builder.state.redirectToHttps).toBe(false)
})

test('Method executeCallbacks works', () => {
  const builder = new AppBuilder()
  let callback = jest.fn()

  builder
    .modifyApp(callback)
    .executeCallbacks('modifyApp', callback => {
      callback()
    })

  expect(callback).toHaveBeenCalled()
})
