index = require('./index.js')


index.run({outLogFile:"/tmp/out",errLogFile:"/tmp/err"},()->
#  console.log "aaaaaa"
  console.log index.options
)
#console.log index.options
##console.log(process.argv[0])