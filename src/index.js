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
const pipeline = require("../src/pipeline")
const file = require("../src/file")

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
    const pipelineFile = core.getInput("file");
    const dependencies = core.getInput("depends");

    // Clean the pipeline ID to make it usable
    var pipelineID = util.cleanPipelineID(origPipelineID);

    // Check what action to do, i:e create or update
    // We can check this by checking whether the pipeline with the
    // passed ID is already present or not.
    const pipelineFetched = pipeline.get(appbaseURL, pipelineID)

    // Update the action accordingly
    const action = pipelineFetched == null ? 'create' : 'update';

    // Generate form data
    const formData = file.buildFormData(pipelineFile, dependencies, pipelineID)

    switch (action) {
        case "create":
            // Create the pipeline
            pipeline.create(appbaseURL, formData)
            break
        case "update":
            // Update the pipeline
            pipeline.update(appbaseURL, formData, pipelineID)
            break
        default:
            break
    }
} catch (error) {
    core.setFailed(error.message);
}