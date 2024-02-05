# NodeStability Module

The NodeStability module is designed to prevent crashes in your Node.js applications by handling and logging various types of errors. It provides an easy-to-use interface for setting up event listeners and integrating with webhooks for error reporting.

## Features

- **Crash Prevention:** The module actively listens for unhandled rejections, uncaught exceptions, and multiple resolves, preventing your application from crashing.
- **Webhook Integration:** Receive error notifications via webhooks, making it easier to monitor and respond to issues.
- **Customizable Options:** Configure the module with options such as enabling/disabling crash prevention, specifying webhook details, and controlling error logging.

## Installation

```bash
npm install nodestability
```

## Usage

```javascript
const NodeStability = require('nodestability');

// Initialize NodeStability with options
const options = {
  enable: true,
  withWebhook: true,
  webhookURL: 'YOUR_WEBHOOK_URL',
  webhookType: 'discord', // or 'selfHosted'
  logErrors: true,
};

const nodeStability = new NodeStability(options);
```

## Configuration Options

- **`enable` (boolean):** Enable or disable crash prevention.
- **`withWebhook` (boolean):** Enable or disable webhook integration.
- **`webhookURL` (string):** Specify the URL of the webhook for error notifications.
- **`webhookType` (string):** Choose the webhook type (`discord` or `selfHosted`).
- **`logErrors` (boolean):** Enable or disable logging errors to the console.

## Examples

Below are examples demonstrating how to integrate the Anti-Crash module into a Node.js app and a Discord.js bot. These examples assume you have already installed the `anti-crash` module.

### Node.js Application Example:

```javascript
// index.js

const NodeStability = require('nodestability');

// Initialize NodeStability with options
const options = {
  enable: true,
  withWebhook: true,
  webhookURL: 'YOUR_WEBHOOK_URL',
  webhookType: 'discord', // or 'selfHosted'
  logErrors: true,
};

const nodeStability = new NodeStability(options);

// Simulate an unhandled rejection
setTimeout(() => {
  Promise.reject(new Error('Simulated Unhandled Rejection'));
}, 2000);

// Simulate an uncaught exception
setTimeout(() => {
  throw new Error('Simulated Uncaught Exception');
}, 4000);
```

### Discord.js Bot Example:

```javascript
// bot.js

const Discord = require('discord.js');
const NodeStability = require('nodestability');

const client = new Discord.Client();
const nodeStability = new NodeStability({
  enable: true,
  withWebhook: true,
  webhookURL: 'YOUR_WEBHOOK_URL',
  webhookType: 'discord',
  logErrors: true,
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', (message) => {
  if (message.content.toLowerCase() === '!simulateError') {
    // Simulate an unhandled rejection within a command
    process.nextTick(() => {
      Promise.reject(new Error('Simulated Unhandled Rejection in Command'));
    });
  }
});

// Log in to Discord
client.login('YOUR_BOT_TOKEN');
```

Replace `'YOUR_WEBHOOK_URL'` and `'YOUR_BOT_TOKEN'` with your actual webhook URL and Discord bot token, respectively.

## Contributing

If you find a bug or have a feature request, please open an issue or submit a pull request. Contributions are welcome!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.