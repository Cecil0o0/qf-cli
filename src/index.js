#! /usr/bin/env node
const signale = require('signale')
const pkg = require('../package.json')
const fs = require('fs')
const program = require('commander')
const downloadRepo = require('download-git-repo')
const handlebars = require('handlebars')
const inquirer = require('inquirer')
const ora = require('ora')

const relationship = {
  'vue-starter': {
    repo: 'github:Cecil0o0/ssr-demo#template'
  },
  'test-starter': {
    repo: 'github:Cecil0o0/templates#master'
  },
  'koa-starter': {
    repo: 'github:Cecil0o0/templates#koa-template'
  }
}

program
  .version(pkg.version, '-v, --version')
  .command('init <template_name> <dir_name>')
  .action((template, dir) => {
    if (!Object.keys(relationship).some(key => template === key)) {
      signale.error('未找到该模板，已提供的模板有')
      Object.keys(relationship).forEach(name => {
        signale.info(name)
      })
      return
    }
    if (fs.existsSync(dir)) {
      signale.error(dir + '目录已存在')
      process.exit(0)
    }

    inquirer.prompt([
      {
        name: 'project_name',
        message: '请输入项目名称'
      },
      {
        name: 'author_name',
        message: '请输入作者名称'
      },
      {
        name: 'description',
        message: '请输入项目描述'
      }
    ]).then(answers => {
      const spinner = ora('正在下载模板...')
      spinner.start()
      downloadRepo(
        relationship[template].repo,
        dir,
        { clone: false },
        err => {
          if (err) {
            spinner.fail()
            return signale.error(err)
          }
          spinner.succeed()
          signale.success('下载成功')
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, 0777)
          Promise.all([handlePackageJSON(dir, answers)]).then(() => {
            signale.success('项目初始化成功')
          })
        }
      )
    })
  })
program.parse(process.argv)

function handlePackageJSON (root, data) {
  return new Promise((resolve, reject) => {
    const filename = root + '/package.json'
    if (fs.existsSync(filename)) {
      const file = fs.readFileSync(filename, 'utf-8')
      fs.writeFileSync(filename, handlebars.compile(file)(data))
    }
    resolve()
  })
}
