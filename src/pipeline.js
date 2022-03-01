/**
 * Handle all methods related to hitting the
 * pipeline API to create/get/update pipelines
 * based on the passed data.
 */

const core = require("@actions/core")
var fetch = require("node-fetch")

module.exports = {
    create: async function (url, body) {
        /**
         * Create the pipeline based on the passed
         * form data. We just need to make a POST
         * request to the pipeline endpoint to create
         * the pipeline.
         * 
         * The pipeline ID will be picked up from the file
         * so we need to make sure the pipeline file contains
         * the proper pipeline ID.
         * 
         * @param {string} url - URL to make the request to
         * @param {FormData} body - FormData body to send in the
         * request.
         */
        const URL = `${url}/_pipeline`
        const response = await fetch(URL, {
            method: "POST",
            body: body,
        })

        // A create is valid only if it returns a 201
        if (response.status == 201) return

        const responseJSON = await response.json()

        // Else show warning and raise error
        core.warning(`Create call returned non 201 response: ${response.status}`)
        core.setFailed(`Creating pipeline failed with response: ${JSON.stringify(responseJSON)}`)
    },
    update: async function (url, body, pipelineID) {
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

        // An update is valid only if it returns a 200
        if (response.status == 200) return

        const responseJSON = await response.json()

        // Else show warning and raise error
        core.warning(`Update call returned non 200 response: ${response.status}`)
        core.setFailed(`Updating pipeline failed with response: ${JSON.stringify(responseJSON)}`)
        process.exitCode = 1
    },
    get: async function (url, pipelineID) {
        /**
         * Get the pipeline using the passed pipeline ID.
         * 
         * If we get a 404, the pipeline will be considered
         * not present.
         * 
         * @param {string} url - URL of the appbase.io instance
         * @param {string} pipelineID - Pipeline ID to fetch with.
         * 
         * @returns {(Object|null)} - JSON of the response or null if not
         * present. 
         */
        const URL = `${url}/_pipeline/${pipelineID}`
        const response = await fetch(URL, {
            method: "GET"
        })

        if (response.status === 404) return null

        const responseJSON = await response.json()
        return responseJSON
    }
}