path = require('path')
os = require('os')
exec  = require('child_process').exec
sha1 =require('sha1')
fs = require('fs')
forever = require('forever-monitor')
colors = require('colors/safe')


tmpName = sha1 process.argv[1].toLowerCase()
tmpDir = os.tmpdir()



options = {
  outLogFile:path.join(__dirname,"OutFile.log")
  errLogFile:path.join(__dirname,"ErrFile.log")
  strStart:"Демон запущений"
  strStop:"Демон зупинений"
  strStatusTrue:"Демон парцюе"
  strStatusFalse:"Демон не парцюе"
  strIsRuning:"Демон вже запущено"
  tmpDir:os.tmpdir()
}
exports.options = options



start = ()->
  status (err, running)->
    if err
      console.error colors.red( "Помилка запуску !!!")
      console.error(error)
    else
      if running
        console.log(colors.blue options.strIsRuning)
      else
        fs.writeFile(path.join( options.tmpDir, tmpName + ".sh"),
          "#!/bin/sh\n  #{path.join( process.argv[0] )}
           #{path.join( process.argv[1] )}
          monitor >
           #{options.outLogFile}
          2> #{options.errLogFile}",(err)->
            if err
              console.error colors.red( "Помилка запису - #{path.join( options.tmpDir, tmpName + ".sh")}!!!")
              console.error err
            else
              fs.chmodSync(path.join( options.tmpDir, tmpName + ".sh"), "0755")
              exec "start-stop-daemon -Sbv  --exec #{path.join( options.tmpDir, tmpName + ".sh")}",(error, stdout, stderr)->
                if error
                  console.error colors.red( "Помилка запуску !!!")
                  console.error(error)
                else
                  console.log(colors.green options.strStart)
        )

monitor = ()->
#  console.log(process.pid.toString())
  pid = require('daemon-pid')(path.join( options.tmpDir, tmpName + ".pid"))
#  fs.writeFile path.join( options.tmpDir, tmpName + ".pid"),process.pid.toString(),()->
  fs.unlink path.join( options.tmpDir, tmpName + ".pid"),(err)->
    pid.write (err)->
      if err
        console.error colors.red( "Помилка запуску !!!" )
        console.error err
      else
        child = new (forever.Monitor)( process.argv[1])
        child.start()

status = (callback)->
  pid = require('daemon-pid')(path.join( options.tmpDir, tmpName + ".pid"))
  pid.running (err, running)->
    if err
      console.error colors.red("Помилка запиту !!!")
      console.error err
      callback err, running
    else
      if callback
        callback err, running
      else
        if running
          console.log(colors.green options.strStatusTrue)
        else
          console.log(colors.red options.strStatusFalse)

stop = (callback)->
  pid = require('daemon-pid')(path.join( options.tmpDir, tmpName + ".pid"))
  pid2 = require('daemon-pid')(path.join( options.tmpDir, tmpName + "W.pid"))
  pid.kill 'SIGTERM', (err)->
    if err
      console.error colors.red("Помилка зупинки !!!")
      console.error(err)
      if callback then callback(err)
    else
      pid.delete(()->)
      pid2.kill 'SIGTERM', (err)->
        if err
          console.error colors.red("Помилка зупинки !!!")
          console.error(err)
          if callback then callback(err)
        else
          console.log(colors.green options.strStop)
          pid2.delete(()->)
          fs.unlink(path.join( options.tmpDir, tmpName + ".sh"),(err)->)
          if callback then callback()

exports.run = (optionsL,callback)->
  if typeof optionsL == "function"
    callback = optionsL
  else
    options.outLogFile = optionsL.outLogFile if optionsL.outLogFile
    options.errLogFile = optionsL.errLogFile if optionsL.errLogFile
    options.strStart = optionsL.strStart if optionsL.strStart
    options.strStop = optionsL.strStop  if optionsL.strStop
    options.strStatusTrue = optionsL.strStatusTrue if optionsL.strStatusTrue
    options.strStatusFalse = optionsL.strStatusFalse if optionsL.strStatusFalse
    options.strIsRuning = optionsL.strIsRuning if optionsL.strIsRuning
    options.tmpDir = optionsL.tmpDir if optionsL.tmpDir
    if optionsL.key
      tmpName = sha1 optionsL.key
  switch process.argv[2]
    when "start"
      start()
    when "stop"
      stop()
    when "restart"
      stop (err)->
        if !err
          start()
    when "status"
      status()
    when "monitor"
      monitor()
    else
      pid = require('daemon-pid')(path.join( options.tmpDir, tmpName + "W.pid"))
      fs.unlink path.join( options.tmpDir, tmpName + "W.pid"),(err)->
        pid.write (err)->
          if err
            console.error colors.red( "Помилка запуску !!!" )
            console.error err
          else
            callback()
