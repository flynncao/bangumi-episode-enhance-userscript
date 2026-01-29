#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const METADATA_PATH = join(__dirname, '..', 'src', 'metadata.json')

function bumpVersion(version) {
  const parts = version.split('.')
  if (parts.length !== 3) {
    throw new Error(`Invalid version format: ${version}`)
  }

  // Bump patch version (last digit)
  parts[2] = String(Number.parseInt(parts[2], 10) + 1)
  return parts.join('.')
}

function main() {
  try {
    const metadata = JSON.parse(readFileSync(METADATA_PATH, 'utf-8'))
    const oldVersion = metadata.version
    const newVersion = bumpVersion(oldVersion)

    metadata.version = newVersion
    writeFileSync(METADATA_PATH, `${JSON.stringify(metadata, null, 2)}\n`, 'utf-8')

    console.log(
      `\u001B[32m✓\u001B[0m Bumped version: \u001B[33m${oldVersion}\u001B[0m → \u001B[36m${newVersion}\u001B[0m`,
    )

    // Stage the changed file
    execSync(`git add "${METADATA_PATH}"`, { stdio: 'inherit' })
    console.log(`\u001B[32m✓\u001B[0m Staged ${METADATA_PATH}`)

    // Commit with version bump message
    const commitMessage = `chore(release): bump version to ${newVersion}`
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' })
    console.log(`\u001B[32m✓\u001B[0m Committed: ${commitMessage}`)

    // Create and push tag
    execSync(`git tag v${newVersion}`, { stdio: 'inherit' })
    console.log(`\u001B[32m✓\u001B[0m Created tag: v${newVersion}`)

    execSync('git push --tags', { stdio: 'inherit' })
    console.log(`\u001B[32m✓\u001B[0m Pushed tags to remote`)
  }
  catch (error) {
    console.error('\u001B[31m✗\u001B[0m Failed to bump version:', error.message)
    process.exit(1)
  }
}

main()
