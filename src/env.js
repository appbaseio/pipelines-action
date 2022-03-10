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


module.exports = {

}