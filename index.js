/**
 * Main entrypoint into the abbaseio/pipelines-action action. This
 * action lets users handle a pipeline from their GitHub repositories.
 * It will automatically create/update the pipeline whenever invoked
 * (through a GitHub Action).
 * 
 * Inputs from user:
 * 
 * - url: URL to connect to Appbaseio's instance and handle creating/updating
 *        the pipeline
 * - pipeline_id: Pipeline ID for the current pipeline. If not passed, will be
 *                set to {{org-repo}}. (Optional)
 */


// Import core and github for actions
const core = require('@actions/core');
const github = require('@actions/github');

try {
    // `who-to-greet` input defined in action metadata file
    const appbaseURL = core.getInput('url');

    // TODO: Verify the URL is valid

} catch (error) {
    core.setFailed(error.message);
}