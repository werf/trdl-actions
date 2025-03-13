import { execOutput } from './exec'

export class GpgCli {
  private readonly bin: string

  constructor(bin: string = 'gpg') {
    this.bin = bin
  }

  async mustGnuGP(): Promise<void> {
    const help = await this.help()
    if (!help.includes('GnuPG')) {
      throw new Error('gpg is not GnuPG. Please install GnuPG')
    }
  }

  async import(ascPath: string): Promise<void> {
    await execOutput(this.bin, ['--import', ascPath])
  }

  async verify(sigPath: string, binPath: string): Promise<void> {
    await execOutput(this.bin, ['--verify', sigPath, binPath])
  }

  async help(): Promise<string> {
    const { stdout } = await execOutput(this.bin, ['--help'])
    return stdout.join('')
  }
}
