const chalk = require('chalk');

module.exports = (text, type) => {
  console.log(chalk.cyan(`» ${type} «`), text);
};

module.exports.error = (text, type) => {
	console.log(chalk.bold.hex("#000000").bold(`» ${type} «`), text);
};

module.exports.err = (text, type) => {
	console.log(chalk.bold.hex("#ff0000").bold(`» ${type} «`), text);
};

module.exports.warn = (text, type) => {
	console.log(chalk.bgYellow.hex("#000000").bold(`» ${type} «`), text);
};

module.exports.master = (text, type) => {
  console.log(chalk.hex("#ff5208")(`» ${type} «`), text);
};

module.exports.blue = (text, type) => {
  console.log(chalk.hex("#0568f2").bold(`» ${type} «`), text);
};

module.exports.green = (text, type) => {
  console.log(chalk.green.bold(`» ${type} «`), text);
};

module.exports.pink = (text, type) => {
  console.log(chalk.hex("#f205c3").bold(`» ${type} «`), text);
};
module.exports.purple = (text, type) => {
  console.log(chalk.hex("#a700ffff").bold(`» ${type} «`), text);
};
