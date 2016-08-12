const cron = require('../lib/cron');
const seneca = require('seneca')();
seneca.use(cron);

seneca.add({ role: 'tick', cmd: 'tack' }, (message, reply) => {
  seneca.log.info('tick-tick', message);

  reply(null);
});

seneca.act({ role: 'cron', cmd: 'create' }, {
  cronTime: '* * * * * *',
  tickAction: 'role:tick,cmd:tack',
  start: true
}, (err, response) => {
  seneca.log.info('Job id', response.id);
});