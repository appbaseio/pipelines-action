/**
 * Handle environment resolution for the pipeline
 * files env vars.
 * 
 * We cannot directly access GitHub secrets so we will
 * have to proxy the secrets through the steps's envs.
 * 
 * We will resolve all envs that start with ${{ `env_key_name` }}
 * by replacing the `env_key_name` with the value.
 * 
 * If the value is not found, it will raise an error.
 */

const core = require("@actions/core")

module.exports = {
    getEnv: function (key) {
        /**
         * Get the env using the passed
         * `key`. If key is not present, we will
         * need to raise a fatal error.
         * 
         * @param {string} key - The key for the env variable
         * 
         * @returns {string} - The env variable value found in the
         * envs.
         */
        const value = process.env[key.toUpperCase()] || ""

        if (!value) {
            core.setFailed(`Invalid value for key: ${key}. Value is either empty or not present.`)
            process.exit(1)
        }

        return value
    },
    extractKey: function (value) {
        /**
         * Extract the key from the value passed in the envs
         * of the pipeline file.
         * 
         * We need to check if the value passed follows the
         * syntax used for replacing a value with something from
         * the envs.
         * 
         * If it doesn't match, we just return an empty string.
         * If it does, we return the key.
         * 
         * @param {string} value - The value to find the key in
         * 
         * @returns {string} - String representing the extacted key or
         * empty string for failure.
         */
        if (!value.match(/^\${{.*?}}$/)) return ""

        // Replace the pattern with the key
        return value.replace(/^\${{\s?(.+)\s?}}$/g, "$1").replace(/\s/g, "")
    },
    resolveEnvs: function (envs) {
        /**
         * Resolve the envs if any value contains a key
         * by exrtacting the key from the process env.
         * 
         * This method will only check the top level envs.
         * Since envs can only be string, it is suggested to keep
         * the envs as stringified JSON in case of non string types.
         * 
         * @param {Object} envs - Object containing the envs.
         * 
         * @returns {Object} - The envs after resolving the env
         * dependencies.
         */
        if (envs == undefined) return envs

        Object.keys(envs).forEach(key => {
            const passedValue = envs[key]

            const extractedKey = this.extractKey(passedValue)
            if (!extractedKey) return

            // if extractedKey is found, get the env value
            // NOTE: Following call will fail if the env key
            // is not present.
            const resolvedValue = this.getEnv(extractedKey)
            envs[key] = resolvedValue
        })

        return envs
    },
    resolveGlobalEnvs: function (globalEnvs) {
        /**
         * Resolve the global envs if any are present in a special
         * format that is supposed to be resolved automatically.
         * 
         * `global_envs` is an array of objects and each object will
         * contain a few keys and values.
         * 
         * The value field is the one that needs to be replaced.
         * 
         * @param {Array.<Object>} globalEnvs - Array containing the
         * global envs object.
         * 
         * @returns {Array.<Object>} - The global envs array after
         * resolving the dependencies
         */
        if (globalEnvs == undefined) return globalEnvs

        globalEnvs.forEach((elementEach, index, originalEnvs) => {
            const passedValue = elementEach.value

            const extractedKey = this.extractKey(passedValue)
            if (!extractedKey) return

            // if extractedKey is found, get the env value
            // NOTE: Following call will fail if the env key
            // is not present.
            const resolvedValue = this.getEnv(extractedKey)

            // Update the value in the original array
            originalEnvs[index]["value"] = resolvedValue
        })

        return globalEnvs
    }
}