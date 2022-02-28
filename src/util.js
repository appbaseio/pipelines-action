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
    }
}