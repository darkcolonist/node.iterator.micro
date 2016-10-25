var moment  = require('moment-timezone'),
    request = require('request'),
    fs      = require('fs'),
    spurl   = require('speakingurl')

moment.tz.setDefault("Asia/Manila")

util = {
  /**
   * if set to true, it will write to server.js.txt instead of sending
   * to console output (best if run in background)
   * 
   * @type {Boolean}
   */
  suppressOutputToLogFile : false,

  /**
   * maximum number of lines per log-file. this is per individual
   * action and will be stored in the ./logs folder as
   * action.name.txt
   * 
   * @type {Number}
   */
  maxIndividualLogLines : 20,

  log : function(message){
    datetime = util.date()

    if(util.suppressOutputToLogFile){
      fs.appendFile('server.js.txt', datetime+" "+message+"\n");
    }else{
      console.log(datetime, message);
    }
  },
  date : function(){
    var datetime = moment().format("YYYY-MM-DD HH:mm:ss")
    return datetime
  },

  logCurl: function(name, message){

    var filename = './logs/'+name+'.txt';

    var contents = []
    if(fs.existsSync(filename)){
      contents = fs.readFileSync(filename).toString().split("\n")

      if (contents.length > util.maxIndividualLogLines){
        var numShifts = contents.length - util.maxIndividualLogLines

        for (var i = 0; i < numShifts; i++) {
          contents.shift()
        }
      }
    }

    contents.push(util.date() + " " + message)
    var contentsStr = contents.join("\n")

    fs.writeFileSync(filename, contentsStr)
  },

  /**
   * curls a url and executes the callback on completion
   *
   * callback should behave as:
   *   function (action, error, response, body) {
   *     if (!error && response.statusCode == 200) {
   *       console.log(body) // Show the HTML for the Google homepage.
   *     }
   *   }
   * 
   * @param  {[type]}   url      [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  curl : function(action, callback){
    // util.log(["started", url])
    // set the latest start
    action.start = moment()

    request(action.url, function (error, response, body) {
      // if (!error && response.statusCode == 200) {
      //   console.log(body) // Show the HTML for the Google homepage.
      // }

      // util.log(["completed", url])
      
      // append total run-time at the end of body
      body += " ("+moment.duration(moment().diff(action.start))+"ms)"

      util.logCurl(action.name, body)

      if(typeof(callback) == 'function')
        callback(action, error, response, body)
    })
  },
  loadActions : function(){
    var rawActions = fs.readFileSync('actions.txt').toString().split("\n")
    var actions    = []

    for (var rI = 0; rI < rawActions.length; rI++) {
      var action = rawActions[rI]

      action = action.replace("\r", "")
      action = action.trim()

      if(action.charAt(0) != "#"){
        actions.push(
          {
            url  : action,
            name : spurl(action)
          }
        )
      }
    }

    return actions
  }
}

module.exports = util