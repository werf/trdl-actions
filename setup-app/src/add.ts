import { debug, endGroup, getBooleanInput, getInput, info, startGroup } from '@actions/core'
import { AddArgs, TrdlCli } from '../../lib/trdl-cli'
import { getAddArgs, preset } from './preset'
import { format } from 'util'

interface inputs extends AddArgs {
  force: boolean
}

function parseInputs(required: boolean): inputs {
  return {
    force: getBooleanInput('force', { required }),
    repo: getInput('repo', { required }),
    url: getInput('url', { required }),
    rootVersion: getInput('root-version', { required }),
    rootSha512: getInput('root-sha512', { required })
  }
}

function mapInputsCmdArgs(inputs: inputs): AddArgs {
  const { repo, url, rootVersion, rootSha512 } = inputs
  return {
    repo,
    url,
    rootVersion,
    rootSha512
  }
}

export async function Do(trdlCli: TrdlCli, p: preset) {
  startGroup('Adding application via "trdl add".')
  const noPreset = p === preset.unknown
  debug(format(`using preset=%s`, !noPreset))

  const inputs = parseInputs(noPreset)
  debug(format(`parsed inputs=%o`, inputs))

  const args = noPreset ? mapInputsCmdArgs(inputs) : getAddArgs(p)
  debug(format(`merged(preset, inputs) args=%o`, args))

  await trdlCli.mustExist()

  const list = await trdlCli.list()
  const found = list.find((item) => args.repo === item.name)

  if (!found) {
    info('Application not found. Adding it via "trdl add".')
    await trdlCli.add(args)
    endGroup()
    return
  }

  if (found.url !== args.url) {
    throw new Error(`Already added repo.url=${found.url} is not matched with given input.url=${args.url}`)
  }

  if (!inputs.force) {
    info(format('Adding skipped. Application found, but inputs.force=%s.', inputs.force))
    endGroup()
    return
  }

  // force adding
  info('Force adding application using combination of "trdl remove" and "trdl add".')
  await trdlCli.remove(args)
  await trdlCli.add(args)
  endGroup()
}
