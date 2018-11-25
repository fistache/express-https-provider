const request = require('request')
const https = require('https')
const express = require('express')

const fs = require('fs')
const path = require('path')

class CertificateApi {
  constructor() {
    this.httpClient = request

    this.baseUrl = 'https://api.yourapp.name'

    this.certificate = {
      cert: null,
      key: null
    }
  }

  makeRequestUrl (requestName) {
    return `${this.baseUrl}/v1_0/${requestName}`
  }

  sendGetRequest (methodName) {
    return new Promise((resolve, reject) => {
      this.httpClient(this.makeRequestUrl(methodName), (err, response, body) => {
        if (err) {
          reject(err)
        }

        if (response.statusCode !== 200) {
          reject('Cannot get SSL certificate from server, abandoning...')
        }

        resolve(body)
      })
    })
  }

  getCertificate () {
    return this.sendGetRequest('certificate.get')
  }
}

module.exports = class Certificate {
  constructor(hostname) {
    this.api = new CertificateApi()

    this.certificatePath = path.resolve(__dirname, '../ssl/cert.pem')
    this.certificateKeyPath = path.resolve(__dirname, '../ssl/key.pem')

    this.hostname = hostname
    this.httpsPort = 443
  }

  setHttpsPort (port) {
    this.httpsPort = port
    return this
  }

  setHostname (hostname) {
    this.hostname = hostname
    return this
  }

  isCached () {
    if (fs.existsSync(this.certificatePath) && fs.existsSync(this.certificateKeyPath)) {
      const cert = fs.readFileSync(this.certificatePath, 'utf8')
      const key = fs.readFileSync(this.certificateKeyPath, 'utf8')
      return !!(cert.length && key.length)
    }
  }

  isValid (certificate) {
    return new Promise((resolve, reject) => {
      const {cert, key} = certificate

      if (!cert || !key || !cert.length || !key.length) {
        reject('Certificate is not valid.')
      }

      const app = express()
      app.use('*', (request, response) => {
        response.end('test')
      })

      const server = https.createServer({cert, key}, app).listen(this.httpsPort)

      const request = https.request({
        host: this.hostname,
        port: this.httpsPort,
        method: 'get',
        path: '/'
      }, response => {
        server.close()

        if (response.socket.authorized) {
          resolve(certificate)
        } else {
          reject('Certificate is not valid.')
        }
      })

      request.on('error', (error) => {
        server.close()
        reject(error)
      })

      request.end()
    })
  }

  getCached () {
    const cert = fs.readFileSync(this.certificatePath, 'utf8')
    const key = fs.readFileSync(this.certificateKeyPath, 'utf8')

    return {
      cert,
      key
    }
  }

  cache (certificate) {
    fs.writeFileSync(this.certificatePath, certificate.cert, 'utf8')
    fs.writeFileSync(this.certificateKeyPath, certificate.key, 'utf8')
  }

  load () {
    return new Promise((resolve, reject) => {
      this.api.getCertificate()
        .then(response => {
          try {
            const json = JSON.parse(response)
            const certificate = {
              cert: json.ssl_certificate.certificate,
              key: json.ssl_certificate.certificate_key
            }
            return this.isValid(certificate)
              .then(certificate => {
                this.cache(certificate)
                resolve(certificate)
              })
              .catch(error => reject(error))
          } catch (e) {
            reject('Response from server is not valid.')
          }
        })
        .catch(error => reject(error))
    })
  }

  get () {
    if (this.isCached()) {
      let certificate = this.getCached()
      return this.isValid(certificate)
        .then(certificate => Promise.resolve(certificate))
        .catch(() => this.load())
    } else {
      return this.load()
    }
  }
}
