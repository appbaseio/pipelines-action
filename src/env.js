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
        const value = process.env[`INPUT_${key.replace(/ /g, '_').toUpperCase()}`] || ""

        if (!key) {
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
        return value.replace(/^\${{\s?(.+)\s?}}$/g, "$1")
    }
}