import { getInput } from '@actions/core'
import { which } from '@actions/io'
import { ok } from 'node:assert/strict'
import { exec } from '@actions/exec'

interface trdlAddArgs {
  repo: string
  url: string
  rootVersion: string
  rootSha512: string
}

enum presetName {
  werf = 'werf'
}

const presetValue: Record<presetName, trdlAddArgs> = {
  // TODO: need help to define preset values
  werf: newTrdlAddArgs(presetName.werf, 'some url', 'some root version', 'some root sha512')
}

interface inputs extends trdlAddArgs {
  presetName: presetName
}

function parseInputs(): inputs {
  return {
    presetName: getInput('preset') as presetName,
    repo: getInput('repo'),
    url: getInput('url'),
    rootVersion: getInput('root-version'),
    rootSha512: getInput('root-sha512')
  }
}

async function assertSystemTrdl(toolName: string): Promise<void> {
  await which(toolName, true)
}

function assertInputs(inputs: inputs): void {
  const { presetName, repo, url, rootVersion, rootSha512 } = inputs

  if (presetName) {
    ok(!repo, 'repo param must be empty when preset param is defined')
    ok(!url, 'url param must be empty when preset param is defined')
    ok(!rootVersion, 'root-version param must be empty when preset param is defined')
    ok(!rootSha512, 'root-sha512 param must be empty when preset param is defined')

    ok(presetName in presetValue, `preset "${presetName}" not found. Available presets: ${Object.keys(presetValue)}`)
    return
  }

  ok(inputs.repo, 'repo param must be defined')
  ok(inputs.url, 'url param must be defined')
  ok(inputs.rootVersion, 'root-version param must be defined')
  ok(inputs.rootSha512, 'root-sha512 param must be defined')
}

function newTrdlAddArgs(repo: string, url: string, rootVersion: string, rootSha512: string): trdlAddArgs {
  return {
    repo,
    url,
    rootVersion,
    rootSha512
  }
}

function translateInputsToTrdlAddArgs(inputs: inputs): trdlAddArgs {
  const { presetName, repo, url, rootVersion, rootSha512 } = inputs

  if (presetName) {
    const item = presetValue[presetName]
    return newTrdlAddArgs(item.repo, item.url, item.rootVersion, item.rootSha512)
  }

  return newTrdlAddArgs(repo, url, rootVersion, rootSha512)
}

async function trdlAdd(repo: string, url: string, rootVersion: string, rootSha512: string): Promise<void> {
  await exec('trdl', ['add', repo, url, rootVersion, rootSha512])
}

export async function Run(): Promise<void> {
  const toolName = 'trdl'
  await assertSystemTrdl(toolName)

  const inputs = parseInputs()
  assertInputs(inputs)

  const args = translateInputsToTrdlAddArgs(inputs)
  await trdlAdd(args.repo, args.url, args.rootVersion, args.rootSha512)
}
