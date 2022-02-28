# About

GitHub Action to manage an Appbase.io pipeline from a github repository.


## Development

The package is written in plain JS and the source code lies on the `src` directory. `src/index.js` is the main entrypoint into the action. However, since GitHub doesn't install the node modules, we are using [@vercel/ncc]() to create a distributable `index.js` that contains all the code.

After making changes to the `src` directory, the `dist/index.js` file can be generated using the following:

```sh
ncc build src/index.js -o dist
```