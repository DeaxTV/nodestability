const { EventEmitter } = require('events');
const colors = require('colors');
const axios = require('axios');
const Discord = require("discord.js");
const packageInfo = require('./package.json');

class NodeStability extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;

    this.checkOptions();

    if (this.options.enable) {
      this.setupEventListeners();
      console.log('[nodestability] : [nodestability] is now preventing crashes.'.green);
    } else {
      console.log('[nodestability] : Option enable is disabled, and [nodestability] will not be preventing any crashes.'.red);
    }

    if (this.options.withWebhook) {
      this.setupWebhook();
    }
  }

  checkOptions() {
    if (!this.options || typeof this.options.enable !== 'boolean') {
      this.logOptionError('enable', 'boolean');
    }

    if (this.options.withWebhook) {
      this.checkWebhookOptions();
    }
  }

  checkWebhookOptions() {
    const webhookOptionErrors = {
      withWebhook: 'boolean',
      webhookURL: 'string',
      webhookType: 'string',
      logErrors: 'boolean'
    };

    for (const [option, type] of Object.entries(webhookOptionErrors)) {
      if (typeof this.options[option] !== type) {
        this.logOptionError(option, type);
      }
    }

    if (!['discord', 'selfHosted'].includes(this.options.webhookType)) {
      console.error('[nodestability] : Option webhookType must be one of "discord/selfHosted"! Check the documentation.'.red);
    }
  }

  logOptionError(option, type) {
    console.error(`[nodestability] : Option ${option} must be a ${type}! Check the documentation.`.red);
  }

  setupEventListeners() {
    const eventTypes = ['unhandledRejection', 'uncaughtException', 'uncaughtExceptionMonitor', 'multipleResolves'];

    eventTypes.forEach((eventType) => {
      process.on(eventType, (...args) => {
        if (this.options.logErrors) {
          this.logError(eventType, ...args);
        }

        if (this.options.withWebhook && this.webhookURL) {
          this.sendToWebhook(eventType, args);
        }
      });
    });
  }

  setupWebhook() {
    if (typeof this.options.webhookURL === 'string') {
      this.webhookURL = this.options.webhookURL;
    } else {
      console.error('[nodestability] : Option webhookURL must be provided as a string when enableWebhook is true! Check the documentation.'.red);
    }
  }

  logError(type, ...args) {
    console.log(`[nodestability] : ${type}`.red);
    console.log(...args);
  }

  sendToWebhook(type, errors) {
    let errorMessage

    if (this.options.webhookType == 'discord') {

      errorMessage = errors.map(error => this.stringifyErrorDiscord(error));

      if (errorMessage.length > 4000) {
        errorMessage = errorMessage.slice(0, 4000) + '...';
      }

      this.sendDiscordWebhook(errorMessage);
    } else {

      errorMessage = errors.map(error => this.stringifyError(error));

      if (errorMessage.length > 4000) {
        errorMessage = errorMessage.slice(0, 4000) + '...';
      }

      this.sendGenericWebhook(errorMessage, type);
    }
  }

  sendDiscordWebhook(errorMessage) {
    try {
      const webhook = new Discord.WebhookClient({ url: this.options.webhookURL.toString() });

      const embed = new Discord.MessageEmbed();

      embed.setTitle("⚠️ New Error");
      embed.setColor("#ffce31");

      let description = "*A new error occurred in the console.*\n\n**Error:** ```";

      for (const arg of errorMessage) {
        description += arg + "\n\n";
      }

      description += "```";

      embed.setDescription(description);
      embed.setTimestamp();
      embed.setFooter("NodeStability");

      webhook.send({ embeds: [embed] });
    } catch (err) {
      console.error('[nodestability] : Failed to send error to webhook.', err);
    }
  }

  sendGenericWebhook(errorMessage, type) {
    const data = {
      content: `**Error Type:** ${type}\n\`\`\`${errorMessage}\`\`\``
    };

    axios.post(this.webhookURL, data)
      .catch((error) => console.error('[nodestability] : Failed to send error to webhook.', error));
  }

  stringifyError(error) {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}\n${error.stack}`;
    } else {
      return error.toString();
    }
  }

  stringifyErrorDiscord(error) {
    if (error instanceof Error) {
      return `${error.stack}`;
    } else {
      return error.toString();
    }
  }
}

module.exports = NodeStability;
