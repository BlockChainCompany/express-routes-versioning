function routesVersioning(options = {}) {
   this.header = options.header || 'accept-version';

   return function(args, notFoundMiddleware) {
      if (!args || typeof(args) !== 'object' ||
         require('util').isArray(args)) {
         console.log('Input has to be either an object');
         return -1;
      }
      return (req, res, next) => {
         const version = getVersion(req, this.header);
         const keys = Object.keys(args);
         let key;
         let tempKey;
         let versionArr;
         let tempVersion;
         if (!version) {
            if (notFoundMiddleware) {
               notFoundMiddleware.call(this, req, res, next);
            } else {
               key = findLatestVersion(keys);
               args[key].call(this, req, res, next);
            }
            return;
         }

         for (let i = 0; i < keys.length; i++) {
            key = keys[i];
            versionArr = version.split('.');
            if (key[0] === '~') {
               tempKey = key.substr(1);
               tempKey = tempKey.split('.').slice(0, 2).join('.');
                versionArr[1] = versionArr[1] || 0;
               tempVersion = versionArr.slice(0, 2).join('.');
            } else if (key[0] === '^') {
               tempKey = key.substr(1);
               tempKey = tempKey.split('.').slice(0, 1).join('.');
               tempVersion = versionArr.slice(0, 1).join('.');
            } else {
               tempKey = key;
               versionArr[1] = versionArr[1] || 0;
               versionArr[2] = versionArr[2] || 0;
               tempVersion = versionArr.join('.');
            }
            if (tempKey === tempVersion) {
               res.setHeader('Version', trimVersion(key));
               args[key].call(this, req, res, next);
               return;
            }
         }
         if (notFoundMiddleware) {
            notFoundMiddleware.call(this, req, res, next);
         } else {
            //get the latest version when no version match found
            key = findLatestVersion(keys);
            res.setHeader('Version', trimVersion(key));
            args[key].call(this, req, res, next);
         }
      }
   }
}


/**
 * Given an array of versions, returns the latest version.
 * Follows semver versioning rules.
 * Supports version types: 1, 1.0, 0.1, 1.0.0
 * Note: 1 is treated as 1.0.0
 **/
function  findLatestVersion(versions) {
    versions.sort(function(v1, v2) {
        const v1Arr = v1.split('.');
        const v2Arr = v2.split('.');
        v1Arr[0] = v1Arr[0].replace('^', '');
        v1Arr[0] = v1Arr[0].replace('~', '');
        v2Arr[0] = v2Arr[0].replace('^', '');
        v2Arr[0] = v2Arr[0].replace('~', '');

        for (let i = 0; i < 2; i ++) {
            if(!v1Arr[i]) {
                v1Arr[i] = 0;
            }
            if(!v2Arr[i]) {
                v2Arr[i] = 0;
            }
        }
        if (isNaN(v2Arr[0]) || v1Arr[0] > v2Arr[0]) {
            return 1;
        } else if (isNaN(v1Arr[0]) || v1Arr[0] < v2Arr[0]) {
            return -1;
        } else if (isNaN(v2Arr[1]) || v1Arr[1] > v2Arr[1]){
            return 1;
        } else if (isNaN(v1Arr[1]) || v1Arr[1] < v2Arr[1]) {
            return -1;
        } else if (isNaN(v2Arr[2]) || v1Arr[2] > v2Arr[2]) {
            return 1;
        } else if (isNaN(v1Arr[2]) || v1Arr[2] < v2Arr[2]) {
            return -1;
        } else {
            return 0;
        }
    });
    return versions[versions.length -1];
}

function trimVersion (version) {
   const vArr = version.split(0);
   vArr[0] = v1Arr[0].replace('^', '').replace('~', '');

   return `${vArr[0] || 0}.${vArr[1] || 0}.${vArr[2] || 0}`
}

/**
 * Gets the version of the application either from accept-version headers
 * or req.version property
 **/
function getVersion(req, header) {
   let version;
   if (!req.version) {
      if (req.headers && req.headers['accept-version']) {
         version = req.headers['accept-version'];
      }
   } else {
      version = req.version;
   }
   return version;
}

module.exports = routesVersioning;
