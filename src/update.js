/**
 * Handle updating the pipeline file based
 * on the passed ID.
 */

var fetch = require("node-fetch")

module.exports = {
    updatePipeline: async function (url, body, pipelineID) {
        /**
         * Update the pipeline based on the passed
         * details.
         * 
         * This method will not check if the pipeline exists
         * with the passed ID. That should be checked in the
         * parent.
         * 
         * We need to send a PUT request to the appbaseio
         * URL with the pipeline ID and the files.
         * 
         * @param {string} url - URL of the appbase.io instance
         * @param {FormData} body - FormData body to send for update.
         * @param {string} pipelineID - Pipeline ID to update with.
         */
        const URL = `${url}/_pipeline/${pipelineID}`
        const response = await fetch(URL, {
            method: "PUT",
            body: body
        })
    }
}