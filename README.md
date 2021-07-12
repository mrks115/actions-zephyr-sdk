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
