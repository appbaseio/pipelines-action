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
const env = require("../src/env")

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
        var pipeDepends = JSON.parse(dependencies)

        // If the parsed JSON is empty, resolve the scriptRefs
        // automatically
        if (!Object.keys(pipeDepends).length) {
            // Resolve dependencies from the yaml file
            scriptRefs = this.extractDependenciesFromPipeline(pipelineFile)
            pipeDepends = this.resolveScriptRefs(scriptRefs, pipelineFile)
        }

        // Validate the files
        core.info("Validating passed files...")
        this.validateFiles(pipelineFile, pipeDepends)

        // Add the pipeline ID in the pipeline file
        core.info("Writing passed pipeline ID to file")
        this.updateFileWithID(pipelineFile, pipelineID)

        // Resolve env references in the `env` object
        // and write back to the file
        core.info("Resolving envs if any")
        this.updateFileWithEnv(pipelineFile)

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
    extractDependenciesFromPipeline: function (file) {
        /**
         * Extract the dependencies from the pipeline.
         * 
         * Just read the yaml file and extract all the scriptRef
         * fields in the stages.
         * 
         * This method does NOT resolve the paths and just returns
         * the scriptRef fields as is.
         * 
         * @param {string} file - Path to the pipeline file.
         * 
         * @returns {Array} - The array of strings that contains all the
         * scriptRef's used in the file.
         */
        const yamlDoc = this.readYaml(file)

        const scriptRefs = new Array()

        // Though 0 stages is an error, it will be handled by the API
        // and we will just ignore it at this point.
        if (yamlDoc.stages == undefined) return scriptRefs

        yamlDoc.stages.forEach(stage => {
            if (stage.scriptRef != undefined) scriptRefs.push(stage.scriptRef)
        })

        return scriptRefs
    },
    resolveScriptRefs: function (scriptRefs, pipelinePath) {
        /**
         * Resolve the script refs based on the path of the
         * pipeline file.
         * 
         * Paths that start with . will be considered root paths
         * and will not be altered at all.
         * 
         * Paths that start with a `/` or anything else will be
         * considerd a relative path to the directory where the
         * pipeline file is located.
         * 
         * @param {Array} scriptRefs - Array of script refs to resolve.
         * @param {string} pipelinePath - Path to the pipeline file in order
         * to extract the directory where pipeline is located.
         * 
         * @returns {Object} - Pipeline dependencies resolved to an array
         * that can be used in formdata.
         */
        const pipelineDirectory = path.dirname(pipelinePath)
        const pipeDepends = new Object()

        scriptRefs.forEach(scriptRef => {
            // If it is an asbolute path, just make it absolute
            // to the root of the directory, else resolve it based
            // on the pipeline directory.
            //
            // ./test.js -> ./examples/test.js
            // /test.js -> ./test.js
            // test.js -> ./examples/test.js
            var resolvedPath = path.isAbsolute(scriptRef) ? "." + scriptRef : path.resolve(pipelineDirectory, scriptRef)
            pipeDepends[scriptRef] = resolvedPath
        })

        return pipeDepends
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
        if (!fs.existsSync(pipelineFile)) {
            core.setFailed(`File does not exist: ${pipelineFile}`)
            process.exit(1)
        }

        // Check if pipeline file is an yaml
        const pipelineExtension = path.extname(pipelineFile)
        if (pipelineExtension != ".yaml" && pipelineExtension != ".yml") {
            core.setFailed(`Pipeline file should be YAML, got ${pipelineFile}`)
            process.exit(1)
        }

        // Validate the pipeline files
        Object.keys(pipelineDependencies).forEach(key => {
            // Make sure the file exists
            const dependencyFile = pipelineDependencies[key]
            if (!fs.existsSync(dependencyFile)) {
                core.setFailed(`File does not exist: ${dependencyFile}`)
                process.exit(1)
            }
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
        var yamlDoc = this.readYaml(file)

        // Update the ID in the doc
        yamlDoc.id = pipelineID

        this.writeYaml(file, yamlDoc)
    },
    updateFileWithEnv: function (file) {
        /**
         * Update the file envs with the resolved envs and
         * write back to the file once done.
         * 
         * @param {string} file - The path to the yaml file.
         */
        var yamlDoc = this.readYaml(file)

        // Resolve the envs
        env.resolveEnvs(yamlDoc.envs)

        this.writeYaml(file, yamlDoc)
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
        const yamlDoc = this.readYaml(file)

        var routesDefined = new Array
        yamlDoc.routes.forEach(route => {
            routesDefined.push(route.path)
        })

        return routesDefined
    },
    readYaml: function (file) {
        /**
         * Read the passed yaml file and return an object
         * that allows access to all the fields in the YAML.
         * 
         * @param {string} file - Path to the yaml file.
         * 
         * @returns {Object} - The read YAML content parsed into
         * a JSON object.
         */
        var yamlDoc

        // Read the file
        try {
            yamlDoc = yaml.load(fs.readFileSync(file, "utf8"));
        } catch (error) {
            core.setFailed(error.message)
            process.exit(1)
        }

        return yamlDoc
    },
    writeYaml: function (file, yamlDoc) {
        /**
         * Write the yamlDoc content to the file by
         * parsing it to yaml.
         * 
         * On success, nothing is returned. On failure the
         * execution of the script is stopped.
         * 
         * @param {string} file - Path to file to write the content
         * to
         * @param {Object} yamlDoc - Parsed YAML content
         * 
         * @returns {null}
         */
        // Write the udpated content
        try {
            fs.writeFileSync(file, yaml.dump(yamlDoc))
        } catch (writeErr) {
            core.setFailed(writeErr.message)
            process.exit(1)
        }
    }
}