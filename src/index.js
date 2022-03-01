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

async function main() {
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
        core.info("Cleaning up the passed pipeline ID to make it URL safe")
        var pipelineID = util.cleanPipelineID(origPipelineID);

        // Check what action to do, i:e create or update
        // We can check this by checking whether the pipeline with the
        // passed ID is already present or not.
        core.info("Trying to get the pipeline from upstream")
        const pipelineFetched = await pipeline.get(appbaseURL, pipelineID)
        core.info("Pipeline fetch completed")

        // Update the action accordingly
        const action = pipelineFetched == null ? 'create' : 'update';
        core.info(`Action determined based on fetched pipeline: ${action}`)

        // Generate form data
        // Thie method will also make sure the `id` field is set to the
        // one passed by user so that the create works properly!
        core.info("Generating form data to be passed based on passed files...")
        const formData = file.buildFormData(pipelineFile, dependencies, pipelineID)

        const actionToPrint = action[0].toUpperCase() + action.slice(1, action.length - 1)
        core.info(`${actionToPrint}ing pipeline using ID: ${pipelineID}`)
        switch (action) {
            case "create":
                // Create the pipeline
                await pipeline.create(appbaseURL, formData)
                break
            case "update":
                // Update the pipeline
                await pipeline.update(appbaseURL, formData, pipelineID)
                break
            default:
                break
        }

        // Print a nice message indicating the pipeline was deployed succesfully
        // and where they can find it.

    } catch (error) {
        core.setFailed(error.message);
    }
}

main();