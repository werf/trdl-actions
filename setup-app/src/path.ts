import { BinPathArgs, TrdlCli } from '../../lib/trdl-cli'
import { addPath, getInput } from '@actions/core'
import { optionalToObject } from '../../lib/optional'
import { getUpdateArgs, preset } from './preset'
import { which } from '@actions/io'

interface inputs extends BinPathArgs {}

function parseInputs(required: boolean): inputs {
  const channel = getInput('channel')
  return {
    repo: getInput('repo', { required }),
    group: getInput('group', { required }),
    ...optionalToObject('channel', channel) // optional field
  }
}

function mapInputsToCmdArgs(inputs: inputs): BinPathArgs {
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

  const foundPath = await which(args.repo, false)
  const appPath = await trdlCli.binPath(args)

  if (foundPath !== '') {
    if (foundPath !== appPath) {
      throw new Error(`Found path=${foundPath} is not matched with "trdl bin-path"=${appPath}`)
    }
    // Skip adding to path because tool is already there.
    return
  }

  // add app to $PATH
  addPath(appPath)
}
