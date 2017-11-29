const winston = require('winston');
const spdlog = require('spdlog');
const fs = require('fs');

function perf(name, logger, end, cb) {
	const start = Date.now();
	let j = 0;

	const loop = () => {
		for (let i = 0; i < 1000; i++ , j++) {
			logger.info('Hello world');
		}

		const now = Date.now();
		const delta = now - start;

		if (delta > 10000) {
			if (end) {
				end();
			}
			console.log();
			return cb();
		}

		process.stdout.write(`${name} - ${Math.round(1000 * j / delta)} req/s       \r`);
		setTimeout(() => loop(), 10);
	};

	loop();
}

const winstonLogger = new winston.Logger({
	transports: [
		new winston.transports.File({
			filename: 'logs/winston.log',
			json: false,
			timestamp: function () {
				return new Date().toISOString();
			},
			formatter: function (options) {
				return options.timestamp() + (options.message ? options.message : '');
			}
		})
	]
});

const spdlogger = new spdlog.RotatingLogger('main', 'logs/spdlog.log', 1024 * 1024 * 5, 5);


try {
	fs.mkdirSync('logs');
} catch (err) {
	//noop
}

perf('spdlog', spdlogger, () => spdlogger.flush(), () => {
	console.log('DONE');
});