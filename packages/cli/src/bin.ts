#!/usr/bin/env node

import { SKIN_SLOT_CATALOG } from '@dsh-skins/spec'
import { formatReport, validateRegistryFile, validateSkinDirectory } from './index.js'

function usage(): never {
  process.stderr.write('Usage: dsh-skin validate <skin-directory> | registry <registry.json> | catalog [--json]\n')
  process.exit(2)
}

const [, , command, target, ...rest] = process.argv

if (command === 'validate') {
  if (target === undefined || rest.length > 0) usage()
  const report = await validateSkinDirectory(target)
  process.stdout.write(`${formatReport(target, report)}\n`)
  if (!report.ok) process.exitCode = 1
} else if (command === 'registry') {
  if (target === undefined || rest.length > 0) usage()
  const report = await validateRegistryFile(target)
  process.stdout.write(`${formatReport(target, report)}\n`)
  if (!report.ok) process.exitCode = 1
} else if (command === 'catalog') {
  if (target !== undefined && target !== '--json') usage()
  if (rest.length > 0) usage()
  process.stdout.write(`${JSON.stringify(SKIN_SLOT_CATALOG, null, target === '--json' ? 2 : 0)}\n`)
} else {
  usage()
}
