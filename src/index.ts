const core = require('@actions/core');
const github = require('@actions/github');
const cache = require('@actions/cache');
const exec = require('@actions/exec');
const os = require('os');

async function run() {
    const url = core.getInput('url');
    const toolchains = core.getInput('toolchains').split(',').map((x: String) => x.trim());

    const toolchains_cachekey = toolchains.join('+');
    const platform = os.platform();
    const cacheKey = `${platform}-zephyrsdk-${url}-${toolchains_cachekey}`;
    const installDir = '/opt/sdk/zephyr-sdk';

    core.exportVariable('ZEPHYR_TOOLCHAIN_VARIANT', 'zephyr');
    core.exportVariable('ZEPHYR_SDK_INSTALL_DIR', installDir);

    const key = await cache.restoreCache([installDir], cacheKey)
    if (key !=  null) {
        core.info(`Cache restored from key: ${key}`);
        return;
    }

    core.info(`Cache not found for key: ${cacheKey}`);

    if (url.endsWith(".run")) {
        await exec.exec('curl', ['-L', url, '-o', 'setup.run']);
        await exec.exec('chmod', ['+x', 'setup.run']);
        await exec.exec('bash', ['-c', `yes | ./setup.run --quiet -- -d ${installDir}`]);
        await exec.exec('rm', ['setup.run']);
    } else if(url.endsWith(".tar.gz")) {
        const toolchain_args = toolchains.flatMap((x: String) => ['-t', x]).join(' ');

        await exec.exec('curl', ['-L', url, '-o', 'sdk.tar.gz']);
        await exec.exec('mkdir', ['-p', installDir]);
        await exec.exec('tar', ['xf', 'sdk.tar.gz', '-C', installDir, '--strip-components=1']);
        await exec.exec('bash', ['-c', `set -eu ; cd ${installDir} ; yes | ./setup.sh -h -c ${toolchain_args}`]);
    } else if(url.endsWith(".tar.xz")) {
        const toolchain_args = toolchains.flatMap((x: String) => ['-t', x]).join(' ');

        await exec.exec('curl', ['-L', url, '-o', 'sdk.tar.xz']);
        await exec.exec('mkdir', ['-p', installDir]);
        await exec.exec('tar', ['xf', 'sdk.tar.xz', '-C', installDir, '--strip-components=1']);
        await exec.exec('bash', ['-c', `set -eu ; cd ${installDir} ; yes | ./setup.sh -h -c ${toolchain_args}`]);
    } else {
        throw 'unsupported toolchain file extension';
    }

    try {
        await cache.saveCache([installDir], cacheKey);
        core.info(`Cache saved with key: ${cacheKey}`);
    } catch (error_: unknown) {
        const error = error_ as Error;

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
