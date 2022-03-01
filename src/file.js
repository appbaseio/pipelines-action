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
var yaml = require("js-yaml")
const core = require("@actions/core")

module.exports = {
    buildFormData: function (pipelineFile, dependencies, pipelineID) {
        /**
         * Build the formdata based on the passed
         * file data.
         * 
         * This method will make sure the pipelineID is
         * set in the pipelineFile.
         * 
         * @param {string} pipelineFile - The main pipeline file
         * to pass.
         * @param {string} dependencies - The pipeline dependency
         * files. This will be a stringified array of objects.
         * @param {string} pipelineID - The pipeline ID to be set
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
        core.info("Validating passed files...")
        this.validateFiles(pipelineFile, pipeDepends)

        // Add the pipeline ID in the pipeline file
        core.info("Writing passed pipeline ID to file")
        this.updateFileWithID(pipelineFile, pipelineID)

        const form = new FormData()

        // Add the pipeline file
        form.append("pipeline", fs.createReadStream(pipelineFile))

        // Add the dependencies if any
        Object.keys(pipeDepends).forEach(key => {
            form.append(key, fs.createReadStream(pipeDepends[key]))
        })

        // Return the form
        return form
    },
    validateFiles: function (pipelineFile, pipelineDependencies) {
        /**
         * Validate the passed files to make sure they
         * follow the standards required by appbase.io's
         * API structure.
         * 
         * This method will throw an exception if any file is
         * invalid or not present.
         * 
         * @param {string} pipelineFile - Path to the pipeline file.
         * @param {Object} pipelineDependencies -  Objects of files
         * referenced in the pipeline file.
         * 
         * @returns {null}
         */
        // Chcek if pipeline file exists
        if (!fs.existsSync(pipelineFile)) core.setFailed(`File does not exist: ${pipelineFile}`)

        // Check if pipeline file is an yaml
        const pipelineExtension = path.extname(pipelineFile)
        if (pipelineExtension != ".yaml" && pipelineExtension != ".yml") core.setFailed(`Pipeline file should be YAML, got ${pipelineFile}`)

        // Validate the pipeline files
        Object.keys(pipelineDependencies).forEach(key => {
            // Make sure the file exists
            const dependencyFile = pipelineDependencies[key]
            if (!fs.existsSync(dependencyFile)) core.setFailed(`File does not exist: ${dependencyFile}`)
        })
    },
    updateFileWithID: function (file, pipelineID) {
        /**
         * Update the pipeline ID in the passed file.
         * 
         * The `id` will be set at the top level of the file, this
         * follows the structure followed by appbase.io's pipeline
         * files.
         * 
         * The file should be an YAML, if not an exception
         * will be thrown.
         * 
         * @param {string} file - The file to work on. Should be an YAML file.
         * @param {string} pipelineID - The pipeline ID to set in the file.
         */
        var yamlDoc

        // Read the file
        try {
            yamlDoc = yaml.load(fs.readFileSync(file, "utf8"));
        } catch (error) {
            core.setFailed(error.message)
        }

        // Update the ID in the doc
        yamlDoc.id = pipelineID

        // Write the udpated content
        try {
            fs.writeFileSync(file, yaml.dump(yamlDoc))
        } catch (writeErr) {
            core.setFailed(writeErr.message)
        }
    },
    readPipelineRoutes: function (file) {
        /**
         * Read the pipeline routes from the passed pipeline
         * file and accordingly extract the routes
         * defined by the user.
         * 
         * The passed file should be present, this method will
         * not validate if the file is present, this should be
         * done by the parent method.
         * 
         * @param {string} file - Path to the pipeline file.
         * 
         * @returns {Array} - Array of routes defined by the user.
         */
        var yamlDoc

        // Read the file
        try {
            yamlDoc = yaml.load(fs.readFileSync(file, "utf8"));
        } catch (error) {
            core.setFailed(error.message)
        }

        var routesDefined = new Array
        yamlDoc.routes.forEach(route => {
            routesDefined.push(route.path)
        })

        return routesDefined
    }
}