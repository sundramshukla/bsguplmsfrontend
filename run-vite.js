import crypto from 'crypto';
import { createHash } from 'crypto';

if (!crypto.hash) {
  crypto.hash = function(algorithm, data, outputEncoding) {
    const hash = createHash(algorithm);
    hash.update(data);
    return hash.digest(outputEncoding);
  };
}

import('./node_modules/vite/bin/vite.js');
