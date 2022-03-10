<div align="center">

## GitHub Action to manage an Appbase.io pipeline from a github repository.

<img src="./.github/assets/preview.png" alt="Preview of deploying action" width=500px>

<br/>

[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)

[![GitHub release](https://img.shields.io/github/v/release/appbaseio/pipelines-action.svg?style=for-the-badge)](https://github.com/appbaseio/pipelines-action/releases/latest)
[![GitHub marketplace](https://img.shields.io/badge/marketplace-reactivesearch--pipelines-pink?logo=github&style=for-the-badge)](https://github.com/marketplace/actions/reactivesearch-pipelines)
[![Maintained](https://img.shields.io/badge/Maintained%3F-Yes-lightgreen?style=for-the-badge)](https://github.com/appbaseio/pipelines-action)

<br/>

### \[[Usage](#usage)] \[[Inputs](#inputs)] \[[Environments](#environments)] \[[Development](#development)]

<br/><br/>

</div>

## Usage

This action can be used out of the box to manage a pipeline from a GitHub repository.

**[Get started with pipelines right away using our template repo](https://github.com/appbaseio/pipelines-template)**

Following is an example action.yaml for using the pipeline with default values and a `pipeline.yaml` file in the root of the repository:

```yaml
on: [push]

jobs:
  pipeline_deploy:
    runs-on: ubuntu-latest
    name: A job to deploy pipeline from the GitHub repo
    steps:
      - name: Checkout repo
        uses: actions/checkout@v2
      - name: Deploy ReactiveSearch Pipeline
        uses: appbaseio/pipelines-action
        with:
          url: ${{secrets.APPBASEIOURL}}
```

## Inputs

It just requires a few inputs from the user:

| Field | Type | Required | Description | Default |
| --- | --- | --- | --- | --- |
| **[url](#url)** | string | true | URL to connect to Appbase.io's instance | --- |
| **[pipeline_id](#pipeline-id)** | string | false | Pipeline ID to map for the pipeline | `<orgname>-<reponame>` |
| **[file](#file)** | string | true | Path to the pipeline file | `./pipeline.yaml` |
| **[depends](#depends)** | string | false | This is a string of objects that are dependencies of the pipeline | '{}' |

### URL

URL is the url to connect to Appbase.io's instance. This URL should contain the credentials in the following way:

```
https://username:password@appbaseioinstanceURL.com
```

It is best to not keep this in the file directly and instead store it as a secret. It can then be referenced as a secret in the action file. [Read more about GitHub secrets here](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

### Pipeline ID

The ID for the pipeline mananged from the current repository. This parameter is optional. By default it is set to `<orgname>-<reponame>` which is picked up from the github context.

If the repository is `appbaseio/pipelines-action`, pipeline ID will be: `appbaseio-pipelines-action`

### File

Path to the pipeline file. This file should follow the pipeline file structure based on Appbase.io's details. By default this will be set to `./pipeline.yaml` which would be a `pipeline.yaml` in the root of the repo.

> The `scriptRef` field in stages can contain relative paths or direct paths and will be resolved by the action. For this to work, `depends` should not be passed in the yaml file.

### Depends

This should be a stringified object of dependencies. The **key** should be the **key** used in the `scriptRef` field at any stage and the **value** should be a path to a file.

If there is a stage defined in the pipeline file:

```yaml
stages:
  - id: "test stage"
    scriptRef: "helloFile"
```

The `depends` object should be:

```json
{
  "helloFile": "./hello.js"
}
```

> NOTE: In order to resolve the `scriptRef` automatically, this field should be omitted.


## Environments

In the pipeline file, `envs` can be passed on a global or a per stage basis. These envs can be strings that are passed directly or referenced using the following syntax:

```yaml
- envs:
    SOME_ENV_KEY: ${{ ENV_VALUE }}
```

The action will resovle any envs that have the value in the above syntax by extracting the key `ENV_VALUE` from the actions environment (GitHub parses that).

Let's say, in the above code, we want the `ENV_VALUE` field to resolve to `some secret string`.

We can [add this as a GitHub secret]() with the key: `ENV_VALUE_SECRET`.

Once, it's added on GitHub, while calling the `pipelines-action`, we need to pass this env in the following way:

```yaml
- name: Deploy Pipeline
  uses: appbaseio/pipelines-action@0.1.1
  with:
    url: ${{secrets.APPBASEIOURL}}
    file: "./basic/pipeline.yaml"
  env:
    ENV_VALUE: ${{ secrets.ENV_VALUE_SECRET }}
```

> We cannot access GitHub's secret variable directly so we need to basically proxy the envs through the stage envs.

Once, we run the action with the above code, the final `pipeline.yaml` will be resolve to the following:

```yaml
- envs:
    SOME_ENV_KEY: some secret string
```


## Development

The package is written in plain JS and the source code lies on the `src` directory. `src/index.js` is the main entrypoint into the action. However, since GitHub doesn't install the node modules, we are using [@vercel/ncc](https://github.com/vercel/ncc) to create a distributable `index.js` that contains all the code.

After making changes to the `src` directory, the `dist/index.js` file can be generated using the following:

```sh
ncc build src/index.js -o dist
```