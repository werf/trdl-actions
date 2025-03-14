import { debug, endGroup, getBooleanInput, getInput, info, startGroup } from '@actions/core'
import { TrdlCli, UpdateArgs } from '../../lib/trdl-cli'
import { getUpdateArgs, preset } from './preset'
import { optionalToObject } from '../../lib/optional'
import { format } from 'util'

interface inputs extends UpdateArgs {
  force: boolean
}

function parseInputs(required: boolean): inputs {
  return {
    force: getBooleanInput('force', { required }),
    repo: getInput('repo', { required }),
    group: getInput('group', { required }),
    ...optionalToObject('channel', getInput('channel')) // optional field
  }
}

function mapInputsToCmdArgs(inputs: inputs): UpdateArgs {
  const { repo, group, channel } = inputs
  return {
    repo,
    group,
    ...optionalToObject('channel', channel) // optional field
  }
}

export async function Do(trdlCli: TrdlCli, p: preset) {
  startGroup('Updating application via "trdl update"')
  const noPreset = p === preset.unknown
  debug(format(`using preset=%s`, !noPreset))

  const inputs = parseInputs(noPreset)
  debug(format(`parsed inputs=%o`, inputs))

  const args = noPreset ? mapInputsToCmdArgs(inputs) : getUpdateArgs(p)
  debug(format(`merged(preset, inputs) args=%o`, args))

  await trdlCli.mustExist()

  const list = await trdlCli.list()
  const found = list.find((item) => args.repo === item.name)
  if (!found) {
    throw new Error(
        `Repository "${args.repo}" is not found. It must be added first using "trdl add"`
    );
  }
  
  info('Updating application via "trdl update".')
  await trdlCli.update(args)
  endGroup()
}
