// Generated by CoffeeScript 1.9.1
(function() {
  var colors, exec, forever, fs, monitor, options, os, path, sha1, start, status, stop, tmpDir, tmpName;

  path = require('path');

  os = require('os');

  exec = require('child_process').exec;

  sha1 = require('sha1');

  fs = require('fs');

  forever = require('forever-monitor');

  colors = require('colors/safe');

  tmpName = sha1(process.argv[1].toLowerCase());

  tmpDir = os.tmpdir();

  options = {
    outLogFile: path.join(__dirname, "OutFile.log"),
    errLogFile: path.join(__dirname, "ErrFile.log"),
    strStart: "Демон запущений",
    strStop: "Демон зупинений",
    strStatusTrue: "Демон парцюе",
    strStatusFalse: "Демон не парцюе",
    strIsRuning: "Демон вже запущено",
    tmpDir: os.tmpdir()
  };

  exports.options = options;

  start = function() {
    return status(function(err, running) {
      if (err) {
        console.error(colors.red("Помилка запуску !!!"));
        return console.error(error);
      } else {
        if (running) {
          return console.log(colors.blue(options.strIsRuning));
        } else {
          return fs.writeFile(path.join(options.tmpDir, tmpName + ".sh"), "#!/bin/sh\n  " + (path.join(process.argv[0])) + " " + (path.join(process.argv[1])) + " monitor > " + options.outLogFile + " 2> " + options.errLogFile, function(err) {
            if (err) {
              console.error(colors.red("Помилка запису - " + (path.join(options.tmpDir, tmpName + ".sh")) + "!!!"));
              return console.error(err);
            } else {
              fs.chmodSync(path.join(options.tmpDir, tmpName + ".sh"), "0755");
              return exec("start-stop-daemon -Sbv  --exec " + (path.join(options.tmpDir, tmpName + ".sh")), function(error, stdout, stderr) {
                if (error) {
                  console.error(colors.red("Помилка запуску !!!"));
                  return console.error(error);
                } else {
                  return console.log(colors.green(options.strStart));
                }
              });
            }
          });
        }
      }
    });
  };

  monitor = function() {
    var pid;
    pid = require('daemon-pid')(path.join(options.tmpDir, tmpName + ".pid"));
    return fs.unlink(path.join(options.tmpDir, tmpName + ".pid"), function(err) {
      return pid.write(function(err) {
        var child;
        if (err) {
          console.error(colors.red("Помилка запуску !!!"));
          return console.error(err);
        } else {
          child = new forever.Monitor(process.argv[1]);
          return child.start();
        }
      });
    });
  };

  status = function(callback) {
    var pid;
    pid = require('daemon-pid')(path.join(options.tmpDir, tmpName + ".pid"));
    return pid.running(function(err, running) {
      if (err) {
        console.error(colors.red("Помилка запиту !!!"));
        console.error(err);
        return callback(err, running);
      } else {
        if (callback) {
          return callback(err, running);
        } else {
          if (running) {
            return console.log(colors.green(options.strStatusTrue));
          } else {
            return console.log(colors.red(options.strStatusFalse));
          }
        }
      }
    });
  };

  stop = function(callback) {
    var pid, pid2;
    pid = require('daemon-pid')(path.join(options.tmpDir, tmpName + ".pid"));
    pid2 = require('daemon-pid')(path.join(options.tmpDir, tmpName + "W.pid"));
    return pid.kill('SIGTERM', function(err) {
      if (err) {
        console.error(colors.red("Помилка зупинки !!!"));
        console.error(err);
        if (callback) {
          return callback(err);
        }
      } else {
        pid["delete"](function() {});
        return pid2.kill('SIGTERM', function(err) {
          if (err) {
            console.error(colors.red("Помилка зупинки !!!"));
            console.error(err);
            if (callback) {
              return callback(err);
            }
          } else {
            console.log(colors.green(options.strStop));
            pid2["delete"](function() {});
            fs.unlink(path.join(options.tmpDir, tmpName + ".sh"), function(err) {});
            if (callback) {
              return callback();
            }
          }
        });
      }
    });
  };

  exports.run = function(optionsL, callback) {
    var pid;
    if (typeof optionsL === "function") {
      callback = optionsL;
    } else {
      if (optionsL.outLogFile) {
        options.outLogFile = optionsL.outLogFile;
      }
      if (optionsL.errLogFile) {
        options.errLogFile = optionsL.errLogFile;
      }
      if (optionsL.strStart) {
        options.strStart = optionsL.strStart;
      }
      if (optionsL.strStop) {
        options.strStop = optionsL.strStop;
      }
      if (optionsL.strStatusTrue) {
        options.strStatusTrue = optionsL.strStatusTrue;
      }
      if (optionsL.strStatusFalse) {
        options.strStatusFalse = optionsL.strStatusFalse;
      }
      if (optionsL.strIsRuning) {
        options.strIsRuning = optionsL.strIsRuning;
      }
      if (optionsL.tmpDir) {
        options.tmpDir = optionsL.tmpDir;
      }
      if (optionsL.key) {
        tmpName = sha1(optionsL.key);
      }
    }
    switch (process.argv[2]) {
      case "start":
        return start();
      case "stop":
        return stop();
      case "restart":
        return stop(function(err) {
          if (!err) {
            return start();
          }
        });
      case "status":
        return status();
      case "monitor":
        return monitor();
      default:
        pid = require('daemon-pid')(path.join(options.tmpDir, tmpName + "W.pid"));
        return fs.unlink(path.join(options.tmpDir, tmpName + "W.pid"), function(err) {
          return pid.write(function(err) {
            if (err) {
              console.error(colors.red("Помилка запуску !!!"));
              return console.error(err);
            } else {
              return callback();
            }
          });
        });
    }
  };

}).call(this);

//# sourceMappingURL=index.js.map