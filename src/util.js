/**
 * Handle util methods regarding the pipeline
 * action.
 */

module.exports = {
    cleanPipelineID: function (pipelineID) {
        /**
         * Clean the pipeline ID to make it
         * usable as an ID.
         * 
         * We will do the following things:
         * - replace `/` with `-`
         * - replace ` ` (space) with `_`
         * 
         * @param {string} pipelineID - uncleaned pipeline ID
         * 
         * @returns {string} - cleaned pipeline ID.
         */
        pipelineID = pipelineID.replace(/\//g, "-")
        pipelineID = pipelineID.replace(/\s/g, "_")
        return pipelineID
    },
    replaceUrlAuth: function (url) {
        /**
         * Replace the auth in the URL with * so that
         * it can be printed properly.
         * 
         * @param {string} url - URL to replace the auth in.
         * 
         * @returns {string} - The cleaned up URL with auth
         * replaced.
         */
        // Extract the URL without auth or https
        baseURL = url.replace(/^((?:\w+:)?\/\/)[^@/]+@|https:\/\//, "")

        return `https://****:****@${baseURL}`
    }
}