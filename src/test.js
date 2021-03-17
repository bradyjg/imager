#!/usr/bin/env node

{/* Imager - An image resizing and compressing tool
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
along with this program. If not, see <https://www.gnu.org/licenses/>. */}

const {exec} = require('child_process');

/** Test #1 */
exec('imager -i test-img.png -r 1:1 -s -p -c -q 80 --clean --srcset --srcset-var img.src',
(error, stdout, stderr) => {
  console.log("ERROR: " + error + "\r\nSTDOUT: " + stdout + "\r\nSTDERR: " + stderr);
})