# Yourappname
[![Current Version](https://img.shields.io/npm/v/@aliaksandrparfiankou/yourappname.svg)](https://github.com/seafoodframework/yourappname)

Yourappname is a JavaScript library for local server 
trusted certificate creation with no chrome warnings, 
errors and other headache. It's work out-of-the-box 
and simple to use.

![Browser screenshot of trusted certificate on local machine (node.js)](https://github.com/seafoodframework/yourappname/tree/master/docs/images/browser.PNG?raw=true "Browser screenshot of trusted certificate on local machine (node.js)")

## Installation
Use the package manager [yarn](https://yarnpkg.com) 
or [npm](https://www.npmjs.com/) to install this 
package.

```bash
yarn add yourappname --dev
```

## Usage
```ecmascript 6
const yourappname = require('yourappname')()

yourappname
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
