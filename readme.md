# express-https-provider
[![Current Version](https://img.shields.io/npm/v/express-trusted-ssl.svg)](https://github.com/seafoodframework/express-https-provider)

This is a JavaScript library that helps you to 
run development express server easily (or just get a 
valid ssl certificate to run a dev server using 
different from express library). Forget about chrome 
warnings, errors and etc. Please, never use this 
library on production server.

![Browser screenshot of trusted certificate on local machine (node.js)](https://raw.githubusercontent.com/seafoodframework/express-https-provider/master/docs/images/browser.PNG "Browser screenshot of trusted certificate on local machine (node.js)")

## Installation
Use the package manager [yarn](https://yarnpkg.com) 
or [npm](https://www.npmjs.com/) to install this 
package.

```bash
yarn add express-https-provider --dev
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

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
