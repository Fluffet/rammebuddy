import { Repository } from '../core'
import { Ramme, RammeEvents } from '.'
import { Request, Response } from 'express'
import { parseIdFromCommand } from './parseIdFromCommand'

export const archiveRammeHandler = async (
  req: Request,
  res: Response,
  repository: Repository<Ramme>,
) => {
  const id = parseIdFromCommand(req.body.text)
  if (!id) {
    res.send('Could not parse id')
    return
  }

  const events = await repository.get(id)

  const lastEvent = events[events.length - 1]
  const highestVersion = lastEvent.version

  const e = {
    ...lastEvent,
    event: RammeEvents.RammeArchived,
    data: undefined,
    timestamp: Date.now(),
    version: 1 + highestVersion,
    committer: req.body.user_name,
  }

  try {
    const repoRes = await repository.save(e)
    const response = `aktivitet med id ${repoRes} arkiverad`
    res.send({
      response_type: 'in_channel',
      text: response,
    })
  } catch (e) {
    res.status(401).send('Could not archive ramme')
  }
}
