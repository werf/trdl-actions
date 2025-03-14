import { BinPathArgs, TrdlCli } from '../../lib/trdl-cli'
import { addPath, debug, endGroup, getInput, info, startGroup } from '@actions/core'
import { optionalToObject } from '../../lib/optional'
import { getUpdateArgs, preset } from './preset'
import { format } from 'util'

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
  startGroup('Modifying $PATH variable to use the application.')
  const noPreset = p === preset.unknown
  debug(format(`using preset=%s`, !noPreset))

  const inputs = parseInputs(noPreset)
  debug(format(`parsed inputs=%o`, inputs))

  const args = noPreset ? mapInputsToCmdArgs(inputs) : getUpdateArgs(p)
  debug(format(`merged(preset, inputs) args=%o`, inputs))

  await trdlCli.mustExist()
  
  const appPath = await trdlCli.binPath(args)
  debug(format(`"trdl bin-path" application path=%s`, appPath))

  // add app to $PATH
  info('Modifying $PATH variable.')
  addPath(appPath)
  endGroup()
}
