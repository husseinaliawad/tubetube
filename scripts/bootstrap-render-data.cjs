/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')
const { spawnSync } = require('node:child_process')

const prisma = new PrismaClient()

async function run() {
  const enabled = (process.env.BOOTSTRAP_IMPORT_ENABLED || 'true').toLowerCase() !== 'false'
  if (!enabled) {
    console.log('[bootstrap] import disabled by BOOTSTRAP_IMPORT_ENABLED=false')
    return
  }

  const existingVideos = await prisma.video.count()
  if (existingVideos > 0) {
    console.log(`[bootstrap] skip import: database already has ${existingVideos} videos`)
    return
  }

  const count = String(Number(process.env.BOOTSTRAP_IMPORT_COUNT || 24) || 24)
  const page = String(Number(process.env.BOOTSTRAP_IMPORT_PAGE || 1) || 1)

  console.log(`[bootstrap] database empty -> importing ${count} videos from fuxxx (page ${page})`)
  const res = spawnSync('node', ['scripts/import-fuxxx-more.cjs', count, page], {
    stdio: 'inherit',
    env: process.env,
  })

  if (res.status !== 0) {
    console.error(`[bootstrap] import script exited with code ${res.status}. continuing startup`)
  } else {
    const total = await prisma.video.count()
    console.log(`[bootstrap] import finished. current video count = ${total}`)
  }
}

run()
  .catch((error) => {
    console.error('[bootstrap] unexpected error:', error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
