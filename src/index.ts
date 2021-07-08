const core = require('@actions/core');
const github = require('@actions/github');
const cache = require('@actions/cache');
const exec = require('@actions/exec');
const os = require('os');

async function run() {
    const url = core.getInput('url');
    const platform = os.platform();
    const cacheKey = `${platform}-zephyrsdk-${url}`;
    const installDir = '/opt/sdk/zephyr-sdk';

    core.exportVariable('ZEPHYR_TOOLCHAIN_VARIANT', 'zephyr');
    core.exportVariable('ZEPHYR_SDK_INSTALL_DIR', installDir);

    const key = await cache.restoreCache([installDir], cacheKey)
    if (key !=  null) {
        core.info(`Cache restored from key: ${key}`);
        return;
    }

    core.info(`Cache not found for key: ${cacheKey}`);

    await exec.exec('curl', ['-L', url, '-o', 'setup.run']);
    await exec.exec('chmod', ['+x', 'setup.run']);
    await exec.exec('bash', ['-c', `yes | ./setup.run --quiet -- -d ${installDir}`]);
    await exec.exec('rm', ['setup.run']);

    try {
        await cache.saveCache([installDir], cacheKey);
        core.info(`Cache saved with key: ${cacheKey}`);
    } catch (error) {
        if (error.name === cache.ValidationError.name) {
            throw error;
        } else if (error.name === cache.ReserveCacheError.name) {
            core.info(error.message);
        } else {
            core.warning(error.message);
        }
    }
}

run().catch(error => {
  core.setFailed(error.message);
});
