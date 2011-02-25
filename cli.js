#!/usr/bin/env node
// The audit_couchdb command-line interface.
//

var lib = require('./lib')
  , LOG = lib.getLogger('audit_couchdb')
  , optimist = require('optimist')
  , audit_couchdb = require('audit_couchdb')
  ;

function usage() {
  console.log([ 'usage: audit_couchdb <URL>'
              , ''
              ].join("\n"));
}

var argv = optimist.default({level: 'info'})
                   .argv
  , couch_url = argv._[0]
  ;

if(!couch_url || argv.help) {
  usage();
  process.exit(couch_url ? 0 : 1);
}

if(!/^https?:\/\//.test(couch_url))
  couch_url = 'http://' + couch_url;

var couch = new audit_couchdb.CouchAudit();
couch.url = couch_url;
couch.proxy = argv.proxy || process.env.http_proxy;
couch.log.setLevel(argv.level);
couch.only_dbs = (argv.db ? [argv.db] : null);

var count = 0;
couch.on('vulnerability', function(problem) {
  count += 1;
  var msg = [count, problem.level, problem.fact].join("\t");
  if(problem.hint)
    msg += " | " + problem.hint;

  if(problem.level === 'low')
    LOG.info(msg);
  else if(problem.level === 'medium')
    LOG.warn(msg);
  else if(problem.level === 'high')
    LOG.error(msg);
  else
    throw new Error("Unknown problem level: " + JSON.stringify(problem));
})

couch.start();
