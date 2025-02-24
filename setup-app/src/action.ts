import { parsePresetInput } from './preset'
import { TrdlCli } from '../../lib/trdl-cli'
import { Do as DoAdd } from './add'
import { Do as DoUpdate } from './update'
import { Do as DoPath } from './path'

export async function Run(): Promise<void> {
  const p = parsePresetInput()

  const cli = new TrdlCli()
  await cli.mustExist()

  await DoAdd(cli, p)
  await DoUpdate(cli, p)
  await DoPath(cli, p)
}
