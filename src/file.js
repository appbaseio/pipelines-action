/**
 * Handle pipeline file related methods
 * 
 * This module will resolve all pipeline file
 * related dependencies. The main pipeline file
 * is passed as `pipeline` in formdata and the
 * others are passed according to their key.
 */

var FormData = require("form-data")

module.exports = {
    buildFormData: function (pipeline_file, dependencies, pipeline_id) {
        /**
         * Build the formdata based on the passed
         * file data.
         * 
         * This method will make sure the pipeline_id is
         * set in the pipeline_file.
         * 
         * @param {string} pipeline_file - The main pipeline file
         * to pass.
         * @param {string} dependencies - The pipeline dependency
         * files. This will be a stringified array of objects.
         * @param {string} pipeline_id - The pipeline ID to be set
         * in the pipeline file. This is optional, if set to `null`
         * will be ignored.
         * 
         * @returns {FormData} - The generated form data to pass to
         * the API.
         */
        const form = new FormData()
        return form
    },
    verifyFiles: function (pipeline_file) {
        /**
         * Verify the passed files to make sure they
         * follow the standards required by appbase.io's
         * API structure.
         * 
         * This method will throw an exception if any file is
         * invalid or not present.
         * 
         * @param {string} pipeline_file - Path to the pipeline file.
         * 
         * @returns {null}
         */
    }
}