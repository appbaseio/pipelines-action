/**
 * Handle pipeline file related methods
 * 
 * This module will resolve all pipeline file
 * related dependencies. The main pipeline file
 * is passed as `pipeline` in formdata and the
 * others are passed according to their key.
 */

var FormData = require("form-data")
var fs = require("fs")
var path = require("path")

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
        // Parse the dependencies string
        // Below should resolve to an object where the key will
        // be the reference and the value the path.
        //
        // The key will be the key for the form and the value
        // will be the path of the dependency file.
        const pipeDepends = JSON.parse(dependencies)

        // Validate the files
        this.validateFiles(pipeline_file, pipeDepends)

        const form = new FormData()
        return form
    },
    validateFiles: function (pipeline_file, pipelineDependencies) {
        /**
         * Validate the passed files to make sure they
         * follow the standards required by appbase.io's
         * API structure.
         * 
         * This method will throw an exception if any file is
         * invalid or not present.
         * 
         * @param {string} pipeline_file - Path to the pipeline file.
         * @param {Object} pipelineDependencies -  Objects of files
         * referenced in the pipeline file.
         * 
         * @returns {null}
         */
        // Chcek if pipeline file exists
        if (!fs.existsSync(pipeline_file)) throw `File does not exist: ${pipeline_file}`

        // Check if pipeline file is an yaml
        const pipelineExtension = path.extname(pipeline_file)
        if (pipelineExtension != ".yaml" && pipelineExtension != ".yml") throw `Pipeline file should be YAML, got ${pipeline_file}`

        // Validate the pipeline files
        Object.keys(pipelineDependencies).forEach(key => {
            // Make sure the file exists
            const dependencyFile = pipelineDependencies[key]
            if (!fs.existsSync(dependencyFile)) throw `File does not exist: ${dependencyFile}`
        })
    }
}