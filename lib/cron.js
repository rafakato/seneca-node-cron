const uuid = require('uuid');
const Joi = require('joi');
const moment = require('moment-timezone');
const CronJob = require('cron').CronJob;
const SUPPORTED_TIMEZONES = moment.tz.names();

module.exports = function (options) {
  const seneca = this;
  const name = 'cron';
  let cronJobs = {};

  function create(message, reply) {
    const schema = Joi.object().options({ allowUnknown: true }).keys({
      cronTime: Joi.alternatives().required().try(Joi.string(), Joi.date()),
      tickAction: Joi.alternatives().required().try(Joi.string(), Joi.object(), Joi.func()),
      onJobStop: Joi.alternatives().optional().try(Joi.string(), Joi.object(), Joi.func()),
      start: Joi.boolean().default(false).optional(),
      oneTimeOnly: Joi.boolean().default(false).optional(),
      timezone: Joi.string().allow(SUPPORTED_TIMEZONES).optional().example('https://tonicdev.com/57a1116f594ef21300a7a434/57ad3cc87965431300ad96b9'),
      runOnInit: Joi.boolean().default(false).optional()
    });

    Joi.validate(message, schema, (err, sanitizedValue) => {
      if (err) {
        return reply(err)
      } else {
        const id = uuid.v4();

        if (typeof sanitizedValue.tickAction === 'string' || typeof sanitizedValue.tickAction === 'object') {
          const pattern = sanitizedValue.tickAction;
          sanitizedValue.tickAction = () => seneca.act(pattern);
        }

        cronJobs[id] = new CronJob({
          cronTime: sanitizedValue.cronTime,
          onTick: sanitizedValue.tickAction,
          onComplete: sanitizedValue.onJobStop,
          start: sanitizedValue.start,
          timeZone: sanitizedValue.timezone,
          runOnInit: sanitizedValue.runOnInit
        });

        return reply(null, {
          id,
          status: sanitizedValue.start ? 'started' : 'created'
        });
      }
    });
  }

  function start(message, reply) {
    const schema = Joi.object().options({ allowUnknown: true }).keys({
      id: Joi.string().guid().required()
    });

    Joi.validate(message, schema, (err, sanitizedValue) => {
      if (err) {
        return reply(err)
      } else {
        const id = sanitizedValue.id;

        seneca.log.debug('Starting cron job', id);
        if (cronJobs[id] === undefined) {
          seneca.log.debug('Cannot start job, job not found', id);
          return reply(new Error('Invalid cron job ' + id));
        }
        else {
          cronJobs[id].start();
          return reply(null, { id: id, status: 'started' })
        }
      }
    });
  }

  function stop(message, reply) {
    const schema = Joi.object().options({ allowUnknown: true }).keys({
      id: Joi.string().guid().required()
    });

    Joi.validate(message, schema, (err, sanitizedValue) => {
      if (err) {
        return reply(err)
      } else {
        const id = sanitizedValue.id;

        seneca.log.debug('Stopping cron job', id);
        if (cronJobs[id] === undefined) {
          seneca.log.debug('Cannot stop job, job not found', id);
          return reply(new Error('Invalid cron job ' + id));
        }
        else {
          cronJobs[id].stop();
          return reply(null, { id: id, status: 'stopped' })
        }
      }
    });
  }

  function remove(message, reply) {
    const schema = Joi.object().options({ allowUnknown: true }).keys({
      id: Joi.string().guid().required()
    });

    Joi.validate(message, schema, (err, sanitizedValue) => {
      if (err) {
        return reply(err)
      } else {
        const id = sanitizedValue.id;

        seneca.log.debug('Removing cron job', id);
        if (cronJobs[id] === undefined) {
          seneca.log.debug('Cannot remove job, job not found', id);
          return reply(new Error('Invalid cron job ' + id));
        }
        else {
          delete cronJobs[id];
          return reply(null, { id: id, status: 'removed' })
        }
      }
    });
  }

  function clear(message, reply) {
    seneca.log.debug('Clearing all jobs');

    const allJobs = Object.keys(cronJobs).map((id) => cronJobs[id]);
    if (allJobs.length) {
      for (let job of allJobs) {
        job.stop();
      }

      cronJobs = {};
    }

    reply(null, { status: 'cleared', total: allJobs.length });
  }

  seneca
    .add({ role: name, cmd: 'create' }, create)
    .add({ role: name, cmd: 'start' }, start)
    .add({ role: name, cmd: 'stop' }, stop)
    .add({ role: name, cmd: 'remove' }, remove)
    .add({ role: name, cmd: 'remove', all: true }, clear);

  return name;
};
