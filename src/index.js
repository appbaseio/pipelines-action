/**
 * Main entrypoint into the abbaseio/pipelines-action action. This
 * action lets users handle a pipeline from their GitHub repositories.
 * It will automatically create/update the pipeline whenever invoked
 * (through a GitHub Action).
 * 
 */


// Import core and github for actions
const core = require('@actions/core');
const github = require('@actions/github');

// Import local modules
const util = require("../src/util")

try {
    /**
     * The user is expected to pass a few things in input:
     * 
     * - url: URL to connect to appbaseio (required)
     * - pipeline_id: Pipeline ID for the current pipeline (not required)
     * 
     */
    const appbaseURL = core.getInput('url');
    const origPipelineID = core.getInput('pipeline_id');

    // Clean the pipeline ID to make it usable
    var pipelineID = util.cleanPipelineID(origPipelineID)

    console.log(appbaseURL);
    console.log(pipelineID);
} catch (error) {
    core.setFailed(error.message);
}