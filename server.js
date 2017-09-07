// http://dev.test/curlable.php?client=nechrons
// http://dev.test/curlable.php?client=space
// http://dev.test/curlable.php?client=olympus
// http://dev.test/curlable.php?client=thanus
// http://dev.test/curlable.php?client=jupiter
// http://dev.test/curlable.php?client=chronus

var express = require('express')
const app = express()
var util = require('./lib/util')

// suppress output to text file
// util.suppressOutputToLogFile = true

/**
 * set this to -1 for unlimited iterations
 * @type {Number}
 */
var iterations = -1
var counter    = 0

/**
 * this holds all the running actions. if an action is in this array
 * don't run it until it vanishes from this array
 * @type {Array}
 */
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

      // util.log(["calling", action.name, action.url])
      
      var runningIndex = running.indexOf(action.name)

      if(runningIndex === -1){
        util.log(["call", action.name])
        running.push(action.name)
        util.curl(action, function(curledAction){
          util.log(["done", curledAction.name, curledAction.duration + "ms"])
          running.splice(running.indexOf(curledAction.name), 1)
        })
      }else{
        util.log(["skip", action.name])
      }
    }
  }else{
    util.log("no actions")
  }

}, 1000)

app.get('/', (request, response) => {  
  response.send(running);
})

app.listen(3001);