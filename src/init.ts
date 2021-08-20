import * as fs from 'fs'
import { join } from 'path'
import * as process from 'process'
import * as Shell from 'shelljs'
import { dclone } from 'dclone' // 多进程执行git命令

const prompts = require('prompts')
const logGreen = (text: string) => {
  console.log(`\x1B[32m ${text}`)
}
const logRed = (text: string) => {
  console.log(`\x1B[31m ${text}`)
}
interface TemplateMap {
  [key: string]: string | undefined
}

interface Options {
  template?: string
}

const init = async (options?: Options) => {
  // 轻量级命令行参数解析
  const argv = require('minimist')(process.argv.slice(2))
  const cwd = process.cwd()
  const templateMap: TemplateMap = {
    'mini-vue3': 'https://github.com/singleManFan/mini-vue3',
    v3app: 'https://github.com/singleManFan/v3app'
  }

  if (!argv._[0]) {
    logRed('未指定应用名称 请使用格式:example npm init fanfan myapp')
    return
  }

  // example my-app
  const targetDir = argv._[0]

  // 效验文件是否存在
  if (fs.existsSync(targetDir)) {
    logRed(`${targetDir}文件夹已存在，请先删除`)
    return
  }

  // npm init fanfan my-app -template mini-vue3
  let template = options?.template ?? argv.template
  if (!template) {
    const answers = await prompts({
      type: 'select',
      name: 'template',
      message: 'Select a template:',
      choices: [
        { title: '✨ mini-vue3', value: 'mini-vue3' },
        { title: '✨ study-vue3', value: 'v3app' }
      ]
    }, {
      onCancel: () => {
        logRed('退出选择')
        process.exit(0)
      }
    })
    template = answers.template
  }

  logGreen(`${template} 模板生成中...`)
  const dir = templateMap[template]
  // 从github下载模板文件
  await dclone({
    dir
  })

  // 将github模板拷贝到目标目录下
  Shell.cp('-r', `${join(cwd, `./${template}`)}`, `${join(cwd, `./${targetDir}`)}`)
  // 删除模板文件
  Shell.rm('-rf', `${join(cwd, template)}`)

  logGreen(`${template} 应用创建完成`)

  console.log(`  cd ${targetDir}`)
  console.log('  npm install (or `yarn`)')
  console.log('  npm start (or `yarn start`)')
  console.log()
}

export {
  init
}
