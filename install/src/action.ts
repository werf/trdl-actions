import { getInput, platform, addPath, info, startGroup, endGroup } from '@actions/core'
import { HttpClient } from '@actions/http-client'
import { downloadTool, find, cacheFile } from '@actions/tool-cache'
import { chmodSync } from 'node:fs'
import { GpgCli } from '../../lib/gpg-cli'
import { TrdlCli } from '../../lib/trdl-cli'

interface inputs {
  channel: string
  version: string
}

function parseInputs(): inputs {
  return {
    channel: getInput('channel'),
    version: getInput('version')
  }
}

async function fetchVersion(channel: string): Promise<string> {
  const client = new HttpClient()
  const resp = await client.get(`https://tuf.trdl.dev/targets/channels/0/${channel}`)
  const version = await resp.readBody()
  return version.trim()
}

async function getOptions(inputs: inputs): Promise<inputs> {
  const channel = inputs.channel || 'stable'
  const version = inputs.version || await fetchVersion(channel) // prettier-ignore

  return {
    channel,
    version
  }
}

function formatDownloadUrls(options: inputs): string[] {
  // https://github.com/actions/toolkit/blob/main/packages/core/README.md#platform-helper
  const plat = translateNodeJSPlatformToTrdlPlatform(platform.platform)
  const arch = translateNodeJSArchToTrdlArch(platform.arch)
  const ext = platform.isWindows ? '.exe' : ''
  const { version } = options
  return [
    `https://tuf.trdl.dev/targets/releases/${version}/${plat}-${arch}/bin/trdl${ext}`, // bin
    `https://tuf.trdl.dev/targets/signatures/${version}/${plat}-${arch}/bin/trdl.sig`, // sig
    `https://trdl.dev/trdl-client.asc` // asc
  ]
}

function translateNodeJSPlatformToTrdlPlatform(platform: string): string {
  switch (platform) {
    case 'linux':
    case 'darwin':
      return platform
    case 'win32':
      return 'windows'
    default:
      throw new Error(`The platform ${platform} not supported`)
  }
}

function translateNodeJSArchToTrdlArch(arch: string): string {
  switch (arch) {
    case 'x64':
      return 'amd64'
    case 'arm64':
      return 'arm64'
    default:
      throw new Error(`The architecture ${arch} not supported`)
  }
}

async function downloadParallel(binUrl: string, sigUrl: string, ascUrl: string): Promise<string[]> {
  return Promise.all([
    // prettier-ignore
    downloadTool(binUrl),
    downloadTool(sigUrl),
    downloadTool(ascUrl)
  ])
}

function findTrdlCache(toolName: string, toolVersion: string): string {
  return find(toolName, toolVersion)
}

async function installTrdl(toolName: string, toolVersion: string, binPath: string): Promise<void> {
  // install tool
  const installedPath = await cacheFile(binPath, toolName, toolName, toolVersion)
  // set permissions
  chmodSync(installedPath, 0o755)
  // add tool to $PATH
  addPath(installedPath)
}

export async function Run(): Promise<void> {
  const options = await getOptions(parseInputs())

  const toolName = 'trdl'
  const toolVersion = options.version

  const toolCache = findTrdlCache(toolName, toolVersion)

  if (toolCache) {
    info(`trdl@v${toolVersion} is found at path ${toolCache}. Installation skipped.`)

    const trdlCli = new TrdlCli()
    await trdlCli.mustExist()

    const args = {
      repo: toolName,
      group: '0',
      channel: 'stable'
    }

    startGroup(`Updating trdl to group=${args.group} and channel=${args.channel}`)
    await trdlCli.update(args)
    endGroup()

    return
  }

  const gpgCli = new GpgCli()
  await gpgCli.mustGnuGP()

  const [binUrl, sigUrl, ascUrl] = formatDownloadUrls(options)
  const [binPath, sigPath, ascPath] = await downloadParallel(binUrl, sigUrl, ascUrl)

  startGroup('Importing and verifying gpg keys.')
  await gpgCli.import(ascPath)
  await gpgCli.verify(sigPath, binPath)
  endGroup()

  startGroup('Installing trdl and adding it to the $PATH.')
  await installTrdl(toolName, toolVersion, binPath)
  endGroup()
}
