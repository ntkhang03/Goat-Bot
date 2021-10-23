const chalk = require('chalk');

module.exports = (text, type) => {
  process.stderr.write(chalk.cyan(`\r» ${type} « `) + text);
};

module.exports.error = (text, type) => {
	process.stderr.write(chalk.bold.hex("#000000").bold(`\r» ${type} « `) + text);
};

module.exports.err = (text, type) => {
  process.stderr.write(chalk.bold.hex("#ff0000").bold(`\r» ${type} « `) + text);
};

module.exports.warn = (text, type) => {
	process.stderr.write(chalk.bgYellow.hex("#000000").bold(`\r» ${type} « `) + text);
};

module.exports.master = (text, type) => {
  process.stderr.write(chalk.hex("#ff5208")(`\r» ${type} « `) + text);
};

module.exports.blue = (text, type) => {
  process.stderr.write(chalk.hex("#0568f2").bold(`\r» ${type} « `) + text);
};

module.exports.green = (text, type) => {
  process.stderr.write(chalk.green.bold(`\r» ${type} « `) + text);
};

module.exports.pink = (text, type) => {
  process.stderr.write(chalk.hex("#f205c3").bold(`\r» ${type} « `) + text);
};

module.exports.purple = (text, type) => {
  process.stderr.write(chalk.hex("#a700ffff").bold(`\r» ${type} « `) + text);
};
