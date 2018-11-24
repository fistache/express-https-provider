const express = require('express')
const vhost = require('vhost')
const hostile = require('hostile')
const http = require('http')
const https = require('https')

const fs = require('fs')
const path = require('path')

const virtualHost = 'yourapp.name'
const certPath = path.resolve(__dirname, 'ssl/cert.pem')
const keyPath = path.resolve(__dirname, 'ssl/key.pem')

const getRequestSync = url => {
  return new Promise((resolve, reject) => {
    https.get(url, resp => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        resolve(data)
      });
    }).on('error', err => {
      console.error(err)
      reject(err)
    })
  });


}

const getCertificateFromServer = async () => {
  // todo: add /v1_0/ prefix to url
  let response = await getRequestSync('https://api.yourapp.name/v1_0/certificate.get')
  try {
    const certificate = JSON.parse(response).ssl_certificate
    return {
      cert: certificate.certificate,
      key: certificate.certificate_key
    }
  } catch (e) {
    return false
  }
}

const provideCertificate = async callback => {
  const certExists = fs.existsSync(certPath)
  const keyExists = fs.existsSync(keyPath)

  let cert = null
  let key = null

  if (certExists && keyExists) {
    cert = fs.readFileSync(certPath, 'utf8')
    key = fs.readFileSync(keyPath, 'utf8')
  } else {
    const serverCertificate = await getCertificateFromServer()

    if (serverCertificate.cert && serverCertificate.key) {
      fs.writeFileSync(certPath, serverCertificate.cert, 'utf8')
      fs.writeFileSync(keyPath, serverCertificate.key, 'utf8')
    } else {
      console.error('Cannot provide a certificate. Aborting...')
      return
    }

    cert = serverCertificate.cert
    key = serverCertificate.key
  }

  const certificate = { cert, key }
  callback && callback(certificate)
}

const usePort = (ports, callback) => {
  //
}

const hostileErrorHandler = err => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
}

const addCloseEventHandler = server => {
  server.on('close', () => {
    hostile.remove('127.0.0.1', virtualHost, hostileErrorHandler)
  })
}

const runServer = async (before, after) => {
  await provideCertificate(async certificate => {
    const {cert, key} = certificate

    // todo: implement usePort
    await usePort([80, 443], port => {
      error(`Port ${port} is already in use. Please use free port.`)
      process.exit(1)
    })

    hostile.set('127.0.0.1', virtualHost, hostileErrorHandler)

    const redirect = express()
    const app = express()

    typeof before === 'function' && before(app, redirect, virtualHost)

    redirect.all('*', (request, response, next) => {
      if (request.secure) {
        return next();
      }
      response.redirect('https://' + request.hostname + request.url);
    })
    redirect.use(vhost(virtualHost, app))

    const httpServer = http.createServer(app).listen(80)
    const httpsServer = https.createServer({key, cert}, redirect).listen(443)

    typeof after === 'function' && after(httpServer, httpsServer, virtualHost)

    addCloseEventHandler(httpsServer)
  })
}

module.exports = {
  provideCertificate,
  runServer
}
