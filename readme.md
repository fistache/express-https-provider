# express-https-provider
![Downloads](https://img.shields.io/npm/dw/express-https-provider.svg)
[![Current Version](https://img.shields.io/npm/v/express-https-provider.svg)](https://github.com/seafoodframework/express-https-provider)
![License](https://img.shields.io/cocoapods/l/AFNetworking.svg)

This is a JavaScript library that helps you to 
run development express server with trusted ssl 
certificate easily (or just get a valid certificate 
to run a dev server using different from express 
library). Forget about chrome warnings, errors and 
etc. Please, never use this library on production 
server.

> Attention! Your server will be serving both at `https://yourapp.name` 
and `http://localhost`, but all request will be redirected to https 
by default.

![Browser screenshot of trusted certificate on local machine (node.js)](https://gist.githubusercontent.com/aliaksandrparfiankou/439bf6ea2eefb8f0b9c6deff86010964/raw/a6614fcba0c4e75312581d64eac03188f51ecac9/browser.PNG "Browser screenshot of trusted certificate on local machine (node.js)")

## Installation
You can use [yarn](https://yarnpkg.com) or [npm](https://www.npmjs.com/) 
to install this package.

#### Yarn
```bash
yarn add --dev express-https-provider
```

#### npm
```bash
npm install --save-dev express-https-provider
```

## Usage
```JavaScript
const provider = require('express-https-provider')()

provider
  .modifyApp((app, state) => {
    app.get('/', (request, response) => {
      response.send('example')
    })
  })
  .done((http, https, state) => {
    console.log(`Serving at ${state.getServingLink()}`)
  })
  .run()
```

## Documention
### Methods
- [modifyApp](#modifyapp)
- [modifyRedirect](#modifyredirect)
- [done](#done)
- [disableRedirectToHttps](#disableredirecttohttps)
- [addCloseEventHandler](#addcloseeventhandler)
- [run](#run)
- [certificate](#certificate)

Note that [modifyApp](#modifyapp), [modifyRedirect](#modifyredirect), 
[done](#done), [disableRedirectToHttps](#disableredirecttohttps) and 
[addCloseEventHandler](#addcloseeventhandler) return link to the object 
on which you call the method so you can combine it in chain.

```JavaScript
const provider = require('express-https-provider')()

provider
    .disableRedirectToHttps()
    .modifyApp(app => {
      //
    })
    .modifyRedirect(redirect => {
      //
    })
```

#### modifyApp
Allow to set up your [express](https://www.npmjs.com/package/express) 
server before it runs.

###### Arguments
- app - This is an [express](https://www.npmjs.com/package/express) 
server instance that process client requests. Use this object 
to set up your server.
- state - [AppState](#appstate) instance

```JavaScript
const provider = require('express-https-provider')()

provider
    .modifyApp((app, state) => {
      app.get('/', (request, response) => {
        response.send(`Serving at ${state.getServingLink()}`)
      })
    })
```

#### modifyRedirect
Allow to set up custom logic on each request before 
it runs.

###### Arguments
- redirect - This is an [express](https://www.npmjs.com/package/express) 
server instance used to redirect each request to 'app' express instance. 
- state - [AppState](#appstate) instance

```JavaScript
const provider = require('express-https-provider')()

provider
    .modifyRedirect((redirect, state) => {
      redirect.all('*', (request, response, next) => {
        if (request.secure) {
          return next()
        }
        // do something
      })
    })
```

#### done
It is an event hook fired after server running.

###### Arguments
- http - Http [server instance](https://nodejs.org/api/net.html#net_class_net_server) (returns by http.createServer().listen())
- https - Https [server instace](https://nodejs.org/api/net.html#net_class_net_server) (returns by https.createServer().listen())
- state - [AppState](#appstate) instance

```JavaScript
const provider = require('express-https-provider')()

provider
  .done((http, https, state) => {
    console.log(`Serving at ${state.getServingLink()}`)
    
    // As example
    http.close()
  })
  .run()
```

#### disableRedirectToHttps
Use this method if you don't want to auto redirect 
from `http://localhost` to `https://yourapp.name`.

###### No arguments

```JavaScript
const provider = require('express-https-provider')()

provider
  .disableRedirectToHttps()
  .run()
```

#### addCloseEventHandler
It is an event hood fired before server stopping.

###### Arguments
- state - [AppState](#appstate) instance

```JavaScript
const provider = require('express-https-provider')()

provider
  .addCloseEventHandler(state => {
    console.log(`Stop serving at ${state.getServingLink()}`)
  })
  .run()
```

#### run
This method runs [express](https://www.npmjs.com/package/express) server.

If you don't want to run [express](https://www.npmjs.com/package/express) 
server and just want to get a certificate to use it on your own 
you can use [certificate](#certificate) method.

###### No arguments

**Return promise**

```JavaScript
const provider = require('express-https-provider')()

provider.run()
```

You can await this method if you need to do it sync.

```JavaScript
const provider = require('express-https-provider')()

const runProvider = async () => {
  await provider.run()
  // Server was run but done hook may not be fired yet!
}
```

#### certificate
Provide trusted SSL certificate without server running.

> Attention! Chainable method like modifyApp and others 
actions do NOT make any effect on it.

###### No arguments

**Return promise**

```JavaScript
const provider = require('express-https-provider')()

provider.certificate()
    .then(certificate => {
      const {cert, key} = certificate
      // do whatever you need
    })
    .catch(error => {
      console.error('Whoops, something went wrong :(')
    })
```

### AppState
#### Methods
- [getServingLink](#getservinglink)
- [getNotSecureServingLink](#getnotsecureservinglink)
- [getHttpPort](#gethttpport)
- [getHttpsPort](#gethttpsport)
- [getHostname](#gethostname)

##### getServingLink
###### No arguments
**Return string**

The method returns secure URL your server serving at.
If 443 port is free it returns `https://yourapp.name`, 
otherwise it do `https://yourapp.name:${port}` where 
`${port}` is automatically selected free port. If you need to get 
a port number for secure URL you can use [getHttpsPort](#gethttpsport) 
method.

##### getNotSecureServingLink
**Return string**

The method returns not secure URL your server serving at. 
If 80 port is free it returns `http://localhost`, otherwise 
it do `http://localhost:${port}` where `${port}` is 
automatically selected free port. If you need to get 
a port number for not secure URL you can use 
[getHttpPort](#gethttpport) method.

##### getHttpPort
###### No arguments
**Return int**

The method returns port your http server listening on.
If 80 port was free it return 80, otherwise automatically 
selected free port.

##### getHttpsPort
###### No arguments
**Return int**

The method returns port your https server listening on.
If 443 port was free it return 443, otherwise automatically 
selected free port.

##### getHostname
###### No arguments
**Return string**

The method returns virtual host domain name your https 
server serving at. Currently is `yourapp.name`.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
