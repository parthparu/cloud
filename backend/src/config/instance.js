const os = require('os');

// Which copy of the backend this process is. Kubernetes gives each pod its own hostname; when
// several copies run on one machine, set INSTANCE_NAME (e.g. copy-A / copy-B) to tell them apart.
module.exports = process.env.INSTANCE_NAME || os.hostname();
