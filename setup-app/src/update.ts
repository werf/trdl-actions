import { getBooleanInput, getInput } from '@actions/core'
import { TrdlCli, UpdateArgs } from '../../lib/trdl-cli'
import { getUpdateArgs, preset } from './preset'
import { optionalToObject } from '../../lib/optional'

interface inputs extends UpdateArgs {
  force: boolean
}

function parseInputs(required: boolean): inputs {
  const channel = getInput('channel')
  return {
    force: getBooleanInput('force', { required }),
    repo: getInput('repo', { required }),
    group: getInput('group', { required }),
    ...optionalToObject('channel', channel) // optional field
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
  const noPreset = p === preset.unknown
  const inputs = parseInputs(noPreset)
  const args = noPreset ? mapInputsToCmdArgs(inputs) : getUpdateArgs(p)

  const list = await trdlCli.list()
  const found = list.find((item) => args.repo === item.name)

  if (!found) {
    await trdlCli.update(args)
    return
  }

  if (args?.channel) {
    if (found.channel !== args.channel) {
      throw new Error(`Found app channel=${found.channel} is not matched with given input.channel=${args.channel}`)
    }
  }

  // force updating
  await trdlCli.update(args)
}
