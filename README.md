# Zephyr SDK Action

This GitHub action makes it easy to install the
[Zephyr SDK](https://github.com/zephyrproject-rtos/sdk-ng)
in a workflow. 

## Usage
```yaml
- uses: grandcentrix/actions-zephyr-sdk@latest
  with:
    url: https://github.com/zephyrproject-rtos/sdk-ng/releases/download/v0.11.4/zephyr-toolchain-arm-0.11.4-setup.run
```

### New SDK format
The new SDKs use the `.tar.gz` file extension and are supported as well.
If you want to install a specific architecture only you can't use toolchain packages though.
Instead, use the minimal SDK bundle and specify the required toolchains like this;
```yaml
- uses: grandcentrix/actions-zephyr-sdk@latest
  with:
    url: https://github.com/zephyrproject-rtos/sdk-ng/releases/download/v0.14.2/zephyr-sdk-0.14.2_linux-x86_64_minimal.tar.gz
    toolchains: aarch64-zephyr-elf,mips-zephyr-elf
```

## Version
Because committing generated files is bad practice, `dist/index.js` is not
available on the `main` branch. Instead there's a manually triggered GitHub
actions workflow which we can use to automatically:

- generate `dist/index.js`
- add and commit that file
- push this to:
  - a new git tag
  - the branch `latest` (force-pushed)
  - to the branch `vX`, with X being the major version (force-pushed)

That means if you always want the latest code, you use `latest`, if you want
to stick to a specific version you use the name of the tag, e.g. `v1.0`.
