/** Imager - An image resizing and compressing tool.
Copyright (C) 2021 Brady Geleynse

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>. */

const fs = require('fs');

module.exports = {
  logError: (msg, console=false) => {
    if (con) console.error(msg);
    fs.appendFileSync('./error_log', logErrorLine(msg) + '\r\n');
  },
  
  log: (msg, con=false) => {
    if (con) console.log(msg);
    fs.appendFileSync('./log', logLine(msg) + '\r\n');
  }
}

/** V8 prototypes for file readouts */
function logErrorLine(message) {
  let e = new Error();
  let frame = e.stack.split("\n")[3];
  return 'ERROR: ' + frame + ': ' + message;
}

function logLine(message) {
  return 'LOG: ' + message;
}