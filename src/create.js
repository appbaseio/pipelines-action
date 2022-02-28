/**
 * Handle creating a pipeline based on the passed
 * details.
 */

var fetch = require("node-fetch")

module.exports = {
    createPipeline: async function (url, body) {
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
        const response = await fetch(url, {
            method: "POST",
            body: body,
        })
    }
}