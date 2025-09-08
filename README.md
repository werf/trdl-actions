# ⚠️ This repository is archived; please use [werf/trdl/actions](https://github.com/werf/trdl/tree/main/actions) instead.

## Table of contents

* [Workflows](#workflows)
  * [Install trdl with `werf/trdl-actions/install` action](#install-trdl-with-werftrdl-actionsinstall-action)
  * [Set up your application executable files with `werf/trdl-actions/setup-app` action](#set-up-your-application-executable-files-with-werftrdl-actionssetup-app-action)
    * [A specific application](#a-specific-application)
    * [A preset application](#a-preset-application)
* [License](#license)

## Workflows

### Install trdl with `werf/trdl-actions/install` action

```yaml
- name: Install trdl
  uses: werf/trdl-actions/install@v0

- name: Use trdl binary
  run: |
    . $(trdl add app https://s3.example.com 12 e1d3c7bcfdf473fe1466c5e9d9030bea0fed857d0563db1407754d2795256e4d063b099156807346cdcdc21d747326cc43f96fa2cacda5f1c67c8349fe09894d)
    . $(trdl use app 2 stable)

    app version
```

### Set up your application executable files with `werf/trdl-actions/setup-app` action

#### A specific application

```yaml
- name: Setup application
  uses: werf/trdl-actions/setup-app@v0
  inputs:
    repo: app
    url: https://s3.example.com
    root-version: 12
    root-sha512: e1d3c7bcfdf473fe1466c5e9d9030bea0fed857d0563db1407754d2795256e4d063b099156807346cdcdc21d747326cc43f96fa2cacda5f1c67c8349fe09894d
    group: 2
    channel: stable

- name: Use application binaries
  run: app version
```

#### A preset application

```yaml
- name: Setup werf
  uses: werf/trdl-actions/setup-app@v0
  inputs:
    preset: werf
    group: 2
    channel: stable

- name: Use werf binaries
  run: werf version
```

## License

Apache License 2.0, see [LICENSE](LICENSE)
