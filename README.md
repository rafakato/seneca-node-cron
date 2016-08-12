![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) cron plugin

# seneca-node-cron
[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status](https://coveralls.io/repos/mirceaalexandru/seneca-cron/badge.svg?branch=master&service=github)](https://coveralls.io/github/mirceaalexandru/seneca-cron?branch=master)


[node-cron][node-cron-url] plugin for Seneca framework.

For a gentle introduction to Seneca itself, see the [senecajs.org](http://senecajs.org) site.

## Install
To install, simply use npm. Remember you will need to install [Seneca.js](http://senecajs.org) separately.

```
npm install seneca
npm install seneca-node-cron
```

## Test
To run tests, simply use npm:

```
npm run test
```

## Examples
Click here to access the [examples](tree/master/examples)

## Actions

### Create cron job
 Create a new cron job
 
 | Parameters | Type | Default | Required | Description |
 | :--- | --- | --- | --- | --- |
 | cronTime | String, Date | | `true` | CronTime accepted by [node-cron][node-cron-url] |
 | tickAction | String, Object, Function | | `true` | Action to be executed on each tick of the job |
 | onJobStop | String, Object, Function | `null` | | Action to be executed when the job is stopped |
 | start | Boolean | `false` | | If **true** automatically starts the job |
 | timezone | String | `''` | | Please refer to [this](https://tonicdev.com/57a1116f594ef21300a7a434/57ad3cc87965431300ad96b9) for the supported timezones |
 | runOnInit | Boolean | `false` | | If **true** fire the tickAction immediately after job creation |
 
 #### Examples
 ```js
   seneca.act({ role: 'cron', cmd: 'create' }, {
     cronTime: '* * * * * *',
     tickAction: 'role:hello,cmd:world'
   }, (err, response) => {
     console.log(response);
     //{
     //  id: 'ac0094f2-d763-4216-8da9-ddee0a0f9f07',
     //  status: 'created'
     //}
   });
  ```
  ```js
    seneca.act({ role: 'cron', cmd: 'create' }, {
      cronTime: '* * * * * *',
      tickAction: 'role:hello,cmd:world',
      start: true
    }, (err, response) => {
      console.log(response);
      //{
      //  id: 'ac0094f2-d763-4216-8da9-ddee0a0f9f07',
      //  status: 'started'
      //}
    });
   ```

### Start cron job
 Start a job matching by id
 
 | Parameters | Type | Default | Required | Description |
 | :--- | --- | --- | --- | --- |
 | id | UUID | | `true` | Id of job |
 
 #### Examples
 ```js
   seneca.act({ role: 'cron', cmd: 'start' }, {
     id: 'ac0094f2-d763-4216-8da9-ddee0a0f9f07'
   }, (err, response) => {
     console.log(response);
     //{
     //  id: 'ac0094f2-d763-4216-8da9-ddee0a0f9f07',
     //  status: 'started'
     //}
   });
  ```

### Stop cron job
 Stops a job matching by id
 
 | Parameters | Type | Default | Required | Description |
 | :--- | --- | --- | --- | --- |
 | id | UUID | | `true` | Id of job |
 
 #### Examples
 ```js
   seneca.act({ role: 'cron', cmd: 'stop' }, {
     id: 'ac0094f2-d763-4216-8da9-ddee0a0f9f07'
   }, (err, response) => {
     console.log(response);
     //{
     //  id: 'ac0094f2-d763-4216-8da9-ddee0a0f9f07',
     //  status: 'stopped'
     //}
   });
  ```

### Remove cron job
 Safelly remove a job matching by id, trying to stop it before remove
 
 | Parameters | Type | Default | Required | Description |
 | :--- | --- | --- | --- | --- |
 | id | UUID | | `true` | Id of job |
 
 #### Examples
 ```js
   seneca.act({ role: 'cron', cmd: 'remove' }, {
     id: 'ac0094f2-d763-4216-8da9-ddee0a0f9f07'
   }, (err, response) => {
     console.log(response);
     //{
     //  id: 'ac0094f2-d763-4216-8da9-ddee0a0f9f07',
     //  status: 'removed'
     //}
   });
  ```

### Remove all cron jobs 
 Safelly remove all jobs, trying to stop then before remove
 
 #### Examples
 ```js
   seneca.act({ role: 'cron', cmd: 'remove', all: true }, (err, response) => {
     console.log(response);
     //{
     //  status: 'cleared',
     //  total: 10
     //}
   });
  ```

## Contributing

The [Senecajs](http://senecajs.org) org encourage open participation.
If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.


[travis-badge]: https://api.travis-ci.org/rafakato/seneca-node-cron.svg
[travis-url]: https://travis-ci.org/rafakato/seneca-node-cron
[npm-badge]: https://badge.fury.io/js/seneca-node-cron.svg
[npm-url]: https://badge.fury.io/js/seneca-node-cron
[node-cron-url]: https://github.com/ncb000gt/node-cron