const semver = require('semver');

class VersionedRoute {

   constructor (options = {}) {
      // Parse options
      this.callbacks = options.callbacks || {};
      this.header = options.header || 'accept-version';
      this.notFoundMiddleware = options.notFoundMiddleware;
   }

   get versions () {
      return Object.keys(this.callbacks);
   }

   add (version, callback) {
      if (!semver.valid(version)) throw new Error(`Must provide a valid semver version: ${version}`);
      if (typeof(callback) !== 'function') throw new Error('Callback must be a function');

      this.callbacks[semver.clean(version)] = callback;

      return this;
   }

   toMiddleware () {
      return (req, res, next) => {
         // Defaults to latest version if  version header is not set
         const version = getVersion(req, this.header) || '*';
         console.log(version);
         const availableVersions = this.versions;
         const selectedVersion = semver.maxSatisfying(availableVersions, version);

         let callback;
         if (selectedVersion) {
            res.setHeader('Version', selectedVersion);
            callback = this.callbacks[selectedVersion];
         }
         else if (this.notFoundMiddleware) {
            callback = notFoundMiddleware;
         } else {
            const latestVersion = semver.maxSatisfying(availableVersions, '*');
            // Get the latest version when no version match found
            res.setHeader('Version', latestVersion);
            callback = this.callbacks[latestVersion];
         }

         callback.call(this, req, res, next);
      }
   }
}

/**
 * Gets the version of the application either from accept-version headers
 * or req.version property
 **/
function getVersion (req, header) {
   let version;
   if (!req.version) {
      if (req.headers && req.headers[header]) {
         version = req.headers[header];
      }
   } else {
      version = req.version;
   }
   return version;
}

module.exports = VersionedRoute;
