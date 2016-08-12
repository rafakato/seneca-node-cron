process.setMaxListeners(0);

const seneca = require('seneca');
const senecaStub = require('seneca-stub');
const cron = require('../lib/cron');
const uuid = require('uuid');

const Lab = require('lab');
const Code = require('code');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

const senecaOpts = { log: 'none' };
let senecaInstance, jobId, counter, counterPauseSnaphot;

describe('role:cron', { timeout: 1000 }, () => {

  lab.beforeEach((done) => {
    senecaInstance = seneca(senecaOpts);
    senecaStub(senecaInstance);

    senecaInstance.log.debug('start');
    senecaInstance.use(cron, {});
    counter = 0;
    counterPauseSnaphot = 0;

    senecaInstance.add({ role: 'test', cmd: 'tick' }, (message, reply) => {
      const nextCounter = (senecaInstance.get('test.counter') || 0) + 1;
      senecaInstance.log.debug('tick-tick', nextCounter);
      senecaInstance.set('test', { counter: nextCounter });

      reply(null, { tick: counter });
    });

    senecaInstance.add({ role: 'test', cmd: 'jobStop' }, (message, reply) => {
      senecaInstance.log.debug('Job stoped');

      reply(null);
    });

    done();
  });

  describe('cmd:create', () => {
    it('should throw error when missing required parameters', (done) => {
      senecaInstance.act({ role: 'cron', cmd: 'create' }, (err) => {
        try {
          expect(err).to.exist();
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should return job details after created', (done) => {
      senecaInstance.act({ role: 'cron', cmd: 'create' }, {
        cronTime: '* * * * *',
        tickAction: { role: 'test', cmd: 'tick' }
      }, (err, response) => {
        try {
          expect(err).to.not.exist();
          expect(response.id).to.be.a.string();
          expect(response.status).to.be.equal('created');
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  describe('cmd:create,start:true', () => {
    it('should return job details after created', (done) => {
      senecaInstance.act({ role: 'cron', cmd: 'create' }, {
        cronTime: '* * * * *',
        tickAction: { role: 'test', cmd: 'tick' },
        start: true
      }, (err, response) => {
        try {
          expect(err).to.not.exist();
          expect(response.id).to.be.a.string();
          expect(response.status).to.be.equal('started');
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  describe('cmd:start', () => {
    it('should throw error when missing required parameters', (done) => {
      senecaInstance.act({ role: 'cron', cmd: 'start' }, (err) => {
        try {
          expect(err).to.exist();
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should throw error when trying to start a job that do not exists', (done) => {
      senecaInstance.act({ role: 'cron', cmd: 'start', id: uuid.v4() }, (err) => {
        try {
          expect(err).to.exist();
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should start cron job', (done) => {
      senecaInstance.act({ role: 'cron', cmd: 'create' }, {
        cronTime: '* * * * *',
        tickAction: { role: 'test', cmd: 'tick' }
      }, (err, response) => {
        expect(err).to.not.exist();

        senecaInstance.act({ role: 'cron', cmd: 'start', id: response.id }, (err, response) => {
          try {
            expect(err).to.not.exist();
            expect(response.status).to.be.equal('started');

            senecaInstance.act({ role: 'cron', cmd: 'stop', id: response.id });
            done();
          } catch (err) {
            done(err);
          }
        });
      });
    });
  });

  describe('cmd:stop', () => {
    it('should throw error when missing required parameters', (done) => {
      senecaInstance.act({ role: 'cron', cmd: 'stop' }, (err) => {
        try {
          expect(err).to.exist();
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should throw error when trying to stop a job that do not exists', (done) => {
      senecaInstance.act({ role: 'cron', cmd: 'stop', id: uuid.v4() }, (err) => {
        try {
          expect(err).to.exist();
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should stop cron job', (done) => {
      senecaInstance.act({ role: 'cron', cmd: 'create' }, {
        cronTime: '* * * * *',
        tickAction: { role: 'test', cmd: 'tick' }
      }, (err, response) => {
        expect(err).to.not.exist();

        senecaInstance.act({ role: 'cron', cmd: 'stop', id: response.id }, (err, response) => {
          try {
            expect(err).to.not.exist();
            expect(response.status).to.be.equal('stopped');
            done();
          } catch (err) {
            done(err);
          }
        });
      });
    });
  });

  describe('cmd:remove', () => {
    it('should throw error when missing required parameters', (done) => {
      senecaInstance.act({ role: 'cron', cmd: 'remove' }, (err) => {
        try {
          expect(err).to.exist();
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should throw error when trying to start a job that do not exists', (done) => {
      senecaInstance.act({ role: 'cron', cmd: 'remove', id: uuid.v4() }, (err) => {
        try {
          expect(err).to.exist();
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should remove cron job', (done) => {
      senecaInstance.act({ role: 'cron', cmd: 'create' }, {
        cronTime: '* * * * *',
        tickAction: { role: 'test', cmd: 'tick' }
      }, (err, response) => {
        expect(err).to.not.exist();

        senecaInstance.act({ role: 'cron', cmd: 'remove', id: response.id }, (err, response) => {
          try {
            expect(err).to.not.exist();
            expect(response.status).to.be.equal('removed');

            done();
          } catch (err) {
            done(err);
          }
        });
      });
    });
  });

  describe('cmd:remove,all:true', () => {
    it('should remove all cron job and return total: 1', (done) => {
      senecaInstance.act({ role: 'cron', cmd: 'create' }, {
        cronTime: '* * * * *',
        tickAction: { role: 'test', cmd: 'tick' }
      }, (err, response) => {
        expect(err).to.not.exist();

        senecaInstance.act({ role: 'cron', cmd: 'remove', all: true }, (err, response) => {
          try {
            expect(err).to.not.exist();
            expect(response.status).to.be.equal('cleared');
            expect(response.total).to.be.equal(1);

            done();
          } catch (err) {
            done(err);
          }
        });
      });
    });

    it('should remove all cron job and return total: 0', (done) => {
      senecaInstance.act({ role: 'cron', cmd: 'remove', all: true }, (err, response) => {
        try {
          expect(err).to.not.exist();
          expect(response.status).to.be.equal('cleared');
          expect(response.total).to.be.equal(0);

          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });
});

