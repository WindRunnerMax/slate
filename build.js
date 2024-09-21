/* eslint-disable no-console */
// yarn eslint build.js --fix
const fs = require('node:fs').promises
const { exec } = require('node:child_process')
const path = require('node:path')
const util = require('node:util')

const execPromise = util.promisify(exec)
const currentDir = path.join(__dirname, 'packages')

async function buildPackages() {
  try {
    const files = await fs.readdir(currentDir)
    const size = files.length
    console.log(`Total packages: ${size}`)
    let index = 0

    for (const file of files) {
      console.log(`Processing package ${index++} of ${size}`)
      const fullPath = path.join(currentDir, file)

      try {
        const stats = await fs.stat(fullPath)

        if (stats.isDirectory()) {
          console.log(fullPath)
          const json = require(path.join(fullPath, 'package.json'))
          const name = json.name

          try {
            const { stderr, stdout } = await execPromise(
              `turbo --filter=${name} build`
            )
            console.log(`stdout: ${stdout}`)
            console.log(`stderr: ${stderr}`)
          } catch (execError) {
            console.error(`exec error: ${execError}`)
          }
        }
      } catch (statError) {
        console.error(`Unable to retrieve file stats: ${statError}`)
      }
    }
  } catch (readdirError) {
    console.error(`Unable to scan directory: ${readdirError}`)
  }
}

buildPackages()
