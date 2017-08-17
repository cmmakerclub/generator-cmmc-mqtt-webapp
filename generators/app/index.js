'use strict'
const path = require('path')
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')
const mkdirp = require('mkdirp')
const _s = require('underscore.string')

// const defaultValidators = {
//   notNull: (input) => {
//     if (input) {
//       return true
//     } else {
//       return 'Please enter a valid input'
//     }
//   }
// }

module.exports = class extends Generator {
  // note: arguments and options should be defined in the constructor.
  constructor (args, opts) {
    super(args, opts)

    // // This makes `appname` argument.
    this.argument('appname', {type: String, required: false, description: 'app name'})
    // // And you can then access it later; e.g. this.appname
  }

  initializing () {
    this.props = {}
    this.pkg = require('../../package.json')
  }

  default () {
    if (path.basename(this.destinationPath()) !== this.props.name) {
      this.log('Your generator must be inside a folder named ' + this.props.name + '\n' +
        'I\'ll automatically create this folder.'
      )

      // create-directory
      const sluggifiedName = _s.slugify(this.props.name)
      mkdirp(sluggifiedName)
      this.destinationRoot(this.destinationPath(sluggifiedName))
    }
  }

  prompting () {
    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the best ' + chalk.red('generator-cmmc-netpie-webapp') + ' generator!'))

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Your project name:',
        default: this.options.appname || this.appname // Default to current folder name
      }
    ]

    return this.prompt(prompts).then(answers => {
      // To access props later use this.props.someAnswer;
      this.props = answers
    })
  }

  writing () {
    this._writingMisc()
    this._writingGit()
    this._writingEditorConfig()
    this._writingBower()
    this._writingScripts()
    this._writingStyles()
    this._writingHtml()
    this._writingLibraries()
    this._writingConfig()
  }

  _writingStyles () {
    let css = 'main.css'

    this.fs.copyTpl(
      this.templatePath(css),
      this.destinationPath('app/styles/' + css))
  }

  _writingScripts () {
    const templateOptions = {
      appname: this.props.name,
      appId: this.props.appId,
      appKey: this.props.appKey,
      appSecret: this.props.appSecret,
      defaultTopic: this.props.defaultTopic,
      deviceAlias: this.props.deviceAlias
    }

    this.fs.copyTpl(this.templatePath('main.js'), this.destinationPath('app/scripts/main.js'), templateOptions)
  }

  _writingHtml () {
    const templateOptions = {
      appname: this.props.name,
      appId: this.props.appId,
      appKey: this.props.appKey,
      appSecret: this.props.appSecret,
      defaultTopic: this.props.defaultTopic,
      deviceAlias: this.props.deviceAlias
    }

    this.fs.copyTpl(this.templatePath('index.html'),
      this.destinationPath('app/index.html'), templateOptions)
  }

  _writingConfig () {
    const templateOptions = {
      appname: this.props.name,
      appId: this.props.appId,
      appKey: this.props.appKey,
      appSecret: this.props.appSecret,
      defaultTopic: this.props.defaultTopic,
      deviceAlias: this.props.deviceAlias
    }

    this.fs.copyTpl(this.templatePath('config.js'),
      this.destinationPath('app/scripts/config.js'), templateOptions
    )
  }

  _writingMisc () {
    mkdirp('app/libs')
    mkdirp('app/images')
    mkdirp('app/fonts')
  }

  _writingLibraries () {
    // this.fs.copyTpl(this.templatePath('libs/microgear.js'),
    //   this.destinationPath('app/libs/microgear.js'))
  }

  _writingBower () {
    const bowerJson = {
      name: _s.slugify(this.appname),
      private: true,
      dependencies: {}
    }

    bowerJson.dependencies['jquery'] = '~2.1.4'
    bowerJson.dependencies['paho-mqtt'] = '*'
    bowerJson.dependencies['bulma'] = '^0.5.0'
    bowerJson.dependencies['moment-timezone'] = '^0.5.13'
    bowerJson.dependencies['components-font-awesome'] = '^4.7.0'

    // if (this.includeJQuery) {  }

    this.fs.writeJSON('bower.json', bowerJson)
    this.fs.copy(
      this.templatePath('bowerrc'),
      this.destinationPath('.bowerrc')
    )
  }

  _writingEditorConfig () {
    this.fs.copy(
      this.templatePath('editorconfig'),
      this.destinationPath('.editorconfig')
    )
  }

  _writingGit () {
    this.fs.copy(
      this.templatePath('gitignore'),
      this.destinationPath('.gitignore'))

    this.fs.copy(
      this.templatePath('gitattributes'),
      this.destinationPath('.gitattributes'))
  }

  install () {
    // const commandExists = require('command-exists').sync
    // const hasYarn = commandExists('yarn')
    this.installDependencies({
      npm: false,
      yarn: false,
      bower: true
    })
  }

  end () {
    this.log(`Happy coding!`)
  }
}
