const portscanner = require('portscanner')

const Certificate = require('./Certificate')

module.exports = class AppBuilder {
  constructor() {
    this.hostname = 'yourapp.name'
    this.localhost = '127.0.0.1'

    this.httpPort = null
    this.httpsPort = null

    this.chainableMethods = {
      modifyApp: 'modifyApp',
      modifyRedirect: 'modifyRedirect',
      done: 'done'
    }

    // This callbacks will contain chainable method callbacks.
    this.callbacks = {}
  }

  storeCallback (method, callback) {
    if (!this.callbacks.hasOwnProperty(method)) {
      this.callbacks[method] = []
    }

    this.callbacks[method].push(callback)
  }

  modifyApp (callback) {
    this.storeCallback(this.chainableMethods.modifyApp, callback)
    return this
  }

  modifyRedirect (callback) {
    this.storeCallback(this.chainableMethods.modifyRedirect, callback)
    return this
  }

  done (callback) {
    this.storeCallback(this.chainableMethods.done, callback)
    return this
  }

  scanFreePort (currentValue) {
    return new Promise((resolve, reject) => {
      // noinspection JSIgnoredPromiseFromCall
      portscanner.checkPortStatus(currentValue, this.localhost, (error, status) => {
        if (error) {
          reject(error)
        }

        if (status === 'open') {
          portscanner.findAPortNotInUse(8000, 9000, this.localhost, (error, port) => {
            if (error) {
              reject(error)
            }

            console.log('free ' + port)
            resolve(port)
          })
        } else if (status === 'closed') {
          resolve(currentValue)
        }
      })
    })
  }

  setPorts () {
    return new Promise((resolve, reject) => {
      this.scanFreePort(80)
        .then(port => {
            this.httpPort = port
            this.scanFreePort(443)
              .then(port => {
                this.httpsPort = port
                resolve()
              })
              .catch(error => reject(error))
        })
        .catch(error => reject(error))
    })
  }

  run () {
    return new Promise(async (resolve, reject) => {
      await this.setPorts()
        .then(() => {
          const certificate = new Certificate()
            .setHttpPort(this.httpPort)
            .setHttpsPort(this.httpsPort)
            .setHostname(this.hostname)

          certificate.get()
            .then(certificate => {
              const {cert, key} = certificate
              //
            })
            .catch(error => {
              console.error('Something went wrong. The certificate has been not received.')
              console.error(error)
            })
        })
        .catch(error => reject(error))
    })
  }
}
