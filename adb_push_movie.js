// search
const glob = require('glob');
// wait for
const Promise = require('bluebird');
// fs
const fs = require('fs');

// video source file path
const videoPath = '/home/kenpeter/Videos/s2';

// child process, exec
const exec = require('child_process').exec;

// adb kill
function adbKillPromise() { return new Promise((resolve, reject) => {
  exec("adb kill-server", (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(stdout);
      console.log('---adb kill---');
      resolve();
    });
  });
};

// adb start
function adbStartPromise() { return new Promise((resolve, reject) => {
    exec("adb start-server", (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(stdout);
      console.log('---adb start---');
      resolve();
    });
  });
};


// now rename promise
function renamePromise() { return new Promise((resolve, reject) => {
  glob(videoPath + "/**/*.mp4", (er, files) => {
      Promise.each(files, (singleClipFile) => {
        return new Promise((resolve1, reject1) => {
          let arr = singleClipFile.split("/");
          let lastElement = arr[arr.length - 1];
          let tmpFileName = lastElement.replace(/[&\/\\#,+()$~%'":*?<>{}\ ]/g, "_");
          let tmpFullFile = videoPath + "/"+ tmpFileName;

          // rename it
          fs.rename(singleClipFile, tmpFullFile, function(err) {
            if ( err ) console.log('ERROR: ' + err);

            console.log("-- Rename one file --");
            console.log(tmpFullFile);
            resolve1();
          }); // end rename
        });
      })
      .then(() => {
        console.log('--- rename all files done ---');
        resolve();
      });
    });

  }); // end promise
};


// adb push promise
function adbPushPromise() { return new Promise((resolve, reject) => {
  glob(videoPath + "/**/*.mp4", (er, files) => {
      Promise.each(files, (singleFile) => {
        return new Promise((resolve1, reject1) => {
          let cmd = "adb push" + " " + singleFile + " " + "/sdcard/Movies";
          exec(cmd, (err, stdout, stderr) => {
            console.log(cmd);
            resolve1();
          });
        });
      })
      .then(() => {
        console.log('---- done push all movies ---');
        resolve();
      });

    });
  });
};


// Run !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
renamePromise()
  .then(() => {
    return adbKillPromise();
  })
  .then(() => {
    return adbStartPromise();
  })
  .then(() => {
    return adbPushPromise();
  })
  .then(() => {
    console.log('---- all done----');
    process.exit(0);
  })
  .catch(err => {
    console.log('Error', err);
    process.exit(1);
  });
