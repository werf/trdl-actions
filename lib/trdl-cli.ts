import { which } from '@actions/io'
import { exec } from '@actions/exec'
import { execOutput } from './exec'
import { optionalToArray } from './optional'

export class TrdlCli {
  private readonly toolName: string

  constructor(toolName: string = 'trdl') {
    this.toolName = toolName
  }

  // throws the error if trdl is not exist
  async mustExist(): Promise<void> {
    await which(this.toolName, true)
  }

  async add(args: AddArgs): Promise<void> {
    const { repo, url, rootVersion, rootSha512 } = args
    await exec(this.toolName, ['add', repo, url, rootVersion, rootSha512])
  }

  async remove(args: RemoveArgs): Promise<void> {
    const { repo } = args
    await exec(this.toolName, ['remove', repo])
  }

  async update(args: UpdateArgs) {
    const { repo, group, channel } = args
    await exec(this.toolName, ['update', repo, group, ...optionalToArray(channel)])
  }

  async binPath(args: BinPathArgs): Promise<string> {
    const { repo, group, channel } = args
    const { stdout } = await execOutput(this.toolName, ['bin-path', repo, group, ...optionalToArray(channel)])
    return stdout.join('')
  }

  async list(): Promise<ListItem[]> {
    const { stdout } = await execOutput(this.toolName, ['list'])
    return stdout.slice(1).map(parseLineToItem)
  }
}

export interface AddArgs {
  repo: string
  url: string
  rootVersion: string
  rootSha512: string
}

export interface RemoveArgs {
  repo: string
}

export interface UpdateArgs {
  repo: string
  group: string
  channel?: string
}

export interface BinPathArgs extends UpdateArgs {}

export interface ListItem {
  name: string
  url: string
  default: string
  channel: string
}

function parseLineToItem(line: string): ListItem {
  const [name, url, default_, channel] = line.split(/ +/)
  return {
    name,
    url,
    default: default_,
    channel
  }
}
