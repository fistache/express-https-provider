const express = require('express')
const http = require('http')
const https = require('https')
const vhost = require('vhost')
const portscanner = require('portscanner')

const Certificate = require('./Certificate')
const AppState = require('./AppState')

module.exports = class AppBuilder {
  constructor() {
    this.state = new AppState()
      .setHostname('yourapp.name')

    this.isPortsAccessChecked = false

    this.localhost = '127.0.0.1'

    this.chainableMethods = {
      modifyApp: 'modifyApp',
      modifyRedirect: 'modifyRedirect',
      done: 'done',
      addCloseEventHandler: 'addCloseEventHandler',
      disableRedirectToHttps: 'disableRedirectToHttps'
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

  executeCallbacks (method, func) {
    if (this.callbacks.hasOwnProperty(method)) {
      const callbacks = this.callbacks[method]
      if (callbacks.length) {
        callbacks.forEach(callback => {
          func(callback)
        })
      }
    }
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

  addCloseEventHandler (callback) {
    this.storeCallback(this.chainableMethods.addCloseEventHandler, callback)
    return this
  }

  disableRedirectToHttps () {
    this.state.disableRedirectToHttps()
    return this
  }

  // Start is http port + 1 that still free,
  // but will be used in the future.
  scanFreePort (currentValue, startPort) {
    return new Promise((resolve, reject) => {
      // noinspection JSIgnoredPromiseFromCall
      portscanner.checkPortStatus(currentValue, this.localhost, (error, status) => {
        if (error) {
          reject(error)
        }

        if (status === 'open') {
          portscanner.findAPortNotInUse(startPort || 8080, 40000, this.localhost, (error, port) => {
            if (error) {
              reject(error)
            }

            resolve(port)
          })
        } else if (status === 'closed') {
          resolve(currentValue)
        } else {
          reject('Error')
        }
      })
    })
  }

  setPorts () {
    return new Promise((resolve, reject) => {
      if (this.isPortsAccessChecked) {
        resolve()
      } else {
        this.scanFreePort(this.state.getHttpPort())
          .then(port => {
            this.state.setHttpPort(port)
            this.scanFreePort(this.state.getHttpsPort(), port + 1000)
              .then(port => {
                this.state.setHttpsPort(port)
                this.isPortsAccessChecked = true
                resolve()
              })
              .catch(error => reject(error))
          })
          .catch(error => reject(error))
      }
    })
  }

  run () {
    return new Promise((resolve, reject) => {
      return this.certificate()
        .then(certificate => {
          const {cert, key} = certificate

          const app = express()
          const redirect = express()

          this.executeCallbacks(this.chainableMethods.modifyApp, callback => {
            callback(app, this.state)
          })
          this.executeCallbacks(this.chainableMethods.modifyRedirect, callback => {
            callback(redirect, this.state)
          })

          if (this.state.getRedirectToHttps()) {
            redirect.all('*', (request, response, next) => {
              if (request.secure) {
                return next()
              }
              response.redirect(`${this.state.getServingLink()}${request.url}`)
            })
          }

          redirect.use(vhost(this.state.getHostname(), app))

          const httpServer = http.createServer(redirect).listen(this.state.getHttpPort())
          const httpsServer = https.createServer({key, cert}, redirect).listen(this.state.getHttpsPort())

          this.executeCallbacks(this.chainableMethods.done, callback => {
            callback(httpServer, httpsServer, this.state)
          })

          process.on('SIGINT', () => {
            let fired = false
            const handle = () => {
              if (fired) {
                this.executeCallbacks(this.chainableMethods.addCloseEventHandler, callback => {
                  callback(this.state)
                })
                process.exit(0)
              } else {
                fired = true
              }
            }
            httpServer.close(handle)
            httpsServer.close(handle)
          })
        })
        .catch(error => reject(error))
    })
  }

  certificate () {
    return new Promise(async (resolve, reject) => {
      await this.setPorts()
        .then(() => {
          const certificate = new Certificate(this.state)

          return certificate.get()
            .then(certificate => resolve(certificate))
            .catch(error => {
              console.error('Something went wrong. The certificate has been not received.')
              console.error(error)
            })
        })
        .catch(error => reject(error))
    })
  }
}
