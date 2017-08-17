'use strict'
const path = require('path')
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')
const mkdirp = require('mkdirp')
const _s = require('underscore.string')

const defaultValidators = {
  notNull: (input) => {
    if (input) {
      return true
    } else {
      return 'Please enter a valid input'
    }
  }
}

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
    this.log(yosay(chalk.red('generator-cmmc-mqtt-webapp') + ' generator!'))

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Your project name:',
        default: this.options.appname || this.appname // Default to current folder name
      }, {
        type: 'input',
        name: 'mqttHostName',
        message: 'Your mqtt host name',
        default: this.config.get('mqttHostName') || 'beta.cmmc.io',
        validate: defaultValidators.notNull
      }, {
        type: 'input',
        name: 'mqttPort',
        message: 'Your mqtt websocket port',
        default: this.config.get('mqttPort') || '59001',
        validate: defaultValidators.notNull
      }, {
        type: 'input',
        name: 'mqttPrefix',
        message: 'Your app prefix',
        default: this.config.get('mqttPrefix') || 'MARU/',
        validate: defaultValidators.notNull
      }, {
        type: 'input',
        name: 'mqttDeviceName',
        message: 'Your app device name',
        default: this.config.get('mqttDeviceName') || 'YOUR-NAME-001',
        validate: defaultValidators.notNull
      }, {
        type: 'input',
        name: 'mqttClientId',
        message: 'your mqttClientId',
        default: this.config.get('mqttClientId') || 'cmmc-ws-' + (10e3 * Math.random()).toFixed(4),
        validate: defaultValidators.notNull
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
      mqttHostName: this.props.mqttHostName,
      mqttPort: this.props.mqttPort,
      mqttPrefix: this.props.mqttPrefix,
      mqttClientId: this.props.mqttClientId,
      mqttDeviceName: this.props.mqttDeviceName
    }

    this.fs.copyTpl(this.templatePath('main.js'), this.destinationPath('app/scripts/main.js'), templateOptions)
  }

  _writingHtml () {
    const templateOptions = {
      appname: this.props.name,
      mqttHostName: this.props.mqttHostName,
      mqttPort: this.props.mqttPort,
      mqttPrefix: this.props.mqttPrefix,
      mqttClientId: this.props.mqttClientId,
      mqttDeviceName: this.props.mqttDeviceName
    }

    this.fs.copyTpl(this.templatePath('index.html'),
      this.destinationPath('app/index.html'), templateOptions)
  }

  _writingConfig () {
    const templateOptions = {
      appname: this.props.name,
      mqttHostName: this.props.mqttHostName,
      mqttPort: this.props.mqttPort,
      mqttPrefix: this.props.mqttPrefix,
      mqttClientId: this.props.mqttClientId,
      mqttDeviceName: this.props.mqttDeviceName
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
