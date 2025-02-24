import { getInput } from '@actions/core'
import { AddArgs, BinPathArgs, UpdateArgs } from '../../lib/trdl-cli'

export enum preset {
  unknown = 'unknown',
  werf = 'werf'
}

const cmdAddArgsMap: Record<preset, AddArgs> = {
  [preset.unknown]: {
    repo: preset.unknown,
    url: '',
    rootVersion: '',
    rootSha512: ''
  },
  [preset.werf]: {
    repo: preset.werf,
    url: 'https://tuf.werf.io',
    rootVersion: '2',
    rootSha512:
      '9c075fb1b91d69308ac3ded709c0f12779f554e852aa90e2595994c217d767e06508b686db7d55fd99e96f357b1ba3640aed1ebe62fc15c9358a70d41355f46c'
  }
}

const cmdUpdateArgsMap: Record<preset, UpdateArgs | BinPathArgs> = {
  [preset.unknown]: {
    repo: preset.unknown,
    group: ''
    // channel is optional field
  },
  [preset.werf]: {
    repo: preset.werf,
    group: 'stable',
    channel: '2'
  }
}

export function getAddArgs(presetVal: preset): AddArgs {
  return cmdAddArgsMap[presetVal]
}

export function getUpdateArgs(presetVal: preset): UpdateArgs | BinPathArgs {
  return cmdUpdateArgsMap[presetVal]
}

export function parsePresetInput(): preset {
  const p = (getInput('preset') as preset) || preset.unknown

  if (!(p in preset)) {
    throw new Error(`preset "${p}" not found. Available presets: ${Object.values(preset).join(' ,')}`)
  }

  return p
}
