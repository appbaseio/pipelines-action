# About

GitHub Action to manage an Appbase.io pipeline from a github repository.

## Usage

This action can be used out of the box to manage a pipeline from a GitHub repository.

Following is an example action.yaml for using the pipeline with default values and a `pipeline.yaml` file in the root of the repository:

```yaml
```

## Inputs

It just requires a few inputs from the user:

| Field | Type | Required | Description | Default |
| --- | --- | --- | --- | --- |
| **`url`** | string | true | URL to connect to Appbase.io's instance | --- |
| **`pipeline_id`** | string | false | Pipeline ID to map for the pipeline | `<orgname>-<reponame>` |
| **`file`** | string | true | Path to the pipeline file | --- |
| **`depends`** | string | false | This is a string of objects that are dependencies of the pipeline | '{}' |

### URL

## Development

The package is written in plain JS and the source code lies on the `src` directory. `src/index.js` is the main entrypoint into the action. However, since GitHub doesn't install the node modules, we are using [@vercel/ncc]() to create a distributable `index.js` that contains all the code.

After making changes to the `src` directory, the `dist/index.js` file can be generated using the following:

```sh
ncc build src/index.js -o dist
```