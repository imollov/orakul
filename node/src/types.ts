export type Job = {
  id: string
  name: string
  run: (encodedData: string) => Promise<string>
}

export type JobRegistry = Record<string, Job>
