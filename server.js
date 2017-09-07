// http://dev.test/curlable.php?client=nechrons
// http://dev.test/curlable.php?client=space
// http://dev.test/curlable.php?client=olympus
// http://dev.test/curlable.php?client=thanus
// http://dev.test/curlable.php?client=jupiter
// http://dev.test/curlable.php?client=chronus

var express = require('express'),
    _ = require('lodash'),
    moment = require('moment')

const app = express()
var util = require('./lib/util')

// suppress output to text file
// util.suppressOutputToLogFile = true

var config = {
  /**
   * set this to -1 for unlimited iterations
   * @type {Number}
   */
  iterations: -1,
  delay: 1000,
  expressPort: 3001,

  /**
   * in seconds before a runner expires
   * @type {Number}
   */
  expiration: 60,
}

var iterations = config.iterations
var counter    = 0

/**
 * this holds all the running actions. if an action is in this array
 * don't run it until it vanishes from this array
 * @type {Array}
 */
// runningObj = {
//   name: "http-staging-imv2-nmsloop-com-panel-routine-unmap_conversations_from_offline_users",
//   expires: "2017-09-07 14:03:00"
// }
var running  = []
var iterator = setInterval(function(){
  counter ++
  if(counter == iterations)
    clearInterval(iterator)

  util.log(["iteration", counter])

  var actions = util.loadActions()

  if(actions.length > 0){
    for(var aIndex in actions){
      var action = actions[aIndex]
      
      var runningIndex = helper.findRunning(action.name)

      if(runningIndex === -1){
        util.log(["call", action.name])

        helper.addRunning(action.name);
        util.curl(action, function(curledAction){
          util.log(["done", curledAction.name, curledAction.duration + "ms"])
          helper.removeRunning(curledAction.name)
        })
      }else{
        util.log(["skip", action.name, moment().diff(running[runningIndex].added, 'ms') + "ms*"])
        helper.tryRemoveRunningExpired(action.name)
      }
    }
  }else{
    util.log("no actions")
  }

}, config.delay)

var helper = {
  findRunning: function(name){
    return _.findIndex(running, function(i){
      return i.name.localeCompare(name) === 0
    })
  },
  removeRunning: function(name){
    running.splice(helper.findRunning(name), 1)
  },
  tryRemoveRunningExpired: function(name){
    var index = helper.findRunning(name)

    var item = running[index]

    var difference = item.expires.diff(moment(), 's')

    if(difference <= 0){
      running.splice(helper.findRunning(name), 1)
      util.log(["expired", name])
    }

    // running.splice(helper.findRunning(name), 1)
  },
  addRunning: function(name){
    var added = moment()
    var expires = moment().add(config.expiration, 's')

    running.push({
      name: name,
      added: added,
      expires: expires
    })
  }
}

app.get('/', (request, response) => {
  _.each(running, function(i){
    i.elapsed = moment().diff(i.added, 's')
  })

  response.send({
    now: moment().format(),
    running: running
  })
})

app.listen(config.expressPort)