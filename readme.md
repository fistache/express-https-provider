# express-trusted-ssl
[![Current Version](https://img.shields.io/npm/v/express-trusted-ssl.svg)](https://github.com/seafoodframework/express-trusted-ssl)

This is a JavaScript library that helps you to 
run development express server easily (or just get a 
valid ssl certificate to run a dev server using 
different from express library). Forget about chrome 
warnings, errors and etc.

![Browser screenshot of trusted certificate on local machine (node.js)](https://raw.githubusercontent.com/seafoodframework/express-trusted-ssl/master/docs/images/browser.PNG "Browser screenshot of trusted certificate on local machine (node.js)")

## Installation
Use the package manager [yarn](https://yarnpkg.com) 
or [npm](https://www.npmjs.com/) to install this 
package.

```bash
yarn add express-trusted-ssl --dev
```

## Usage
```JavaScript
const server = require('express-trusted-ssl')()

server
  .modifyApp((app, state) => {
    app.get('/', (request, response) => {
      response.end(`Trusted certificate on ${state.getServingLink()}`)
    })
  })
  .run()
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
