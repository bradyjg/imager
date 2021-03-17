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

const os = require('os');
const {exec} = require('child_process');

const platform = os.platform();

/** If platform is linux need sudo prefix */
if (platform === 'linux') {
  console.log('Linking program alias for Linux [sudo npm link]');
  exec('sudo npm link');
}
/** Else Windows or Mac no sudo */
else {
  if (platform === 'windows')
    console.log('Linking program alias for Windows [npm link]');
  else if (platform === 'mac')
    console.log('Linking program alias for Mac [npm link]');
  exec('npm link');
}