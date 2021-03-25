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

module.exports = {
  'apple-watch': [
    { width: 312, height: 390 },
    { width: 272, height: 340 },
  ],
  'chromebook-pixel' : [
    { width: 2560, height: 1700 },
  ],  
  'google-pixel': [
    { width: 1080, height: 1920 },
  ],
  'google-pixel-xl, google-pixel-2-xl': [
    { width: 1440, height: 2560 },
  ],
  'google-pixel-3-xl': [
    { width: 1440, height: 2960 },
  ],
  'google-pixel-3, google-pixel-3a-xl': [
    { width: 1080, height: 2160 },
  ],
  'google-pixel-3a': [
    { width: 1080, height: 2220 },
  ],
  'google-pixel-4-xl': [
    { width: 869, height: 1440 },
  ],
  'google-pixel-4': [
    { width: 1080, height: 2280 },
  ],
  'ipad-pro': [
    { width: 2048, height: 2732 },
  ],
  'ipad-3, ipad-4, ipad-air-1, ipad-air-2, ipad-mini-2, ipad-mini-3': [
    { width: 1536, height: 2048 },
  ],
  'ipad-mini': [
    { width: 768, height: 1024 },
  ],
  'iphone-5, ipod-touch' :[
    { width: 640, height: 1136 },
  ],
  'iphone-6, iphone-6s, iphone-7, iphone-8' :[
    { width: 750, height: 1334 },
  ],
  'iphone-6-plus, iphone-6s-plus, iphone-7+, iphone-8+' :[
    { width: 1080, height: 1920 },
  ],
  'iphone-x, iphone-xs': [
    { width: 1125, height: 2436 },
  ],
  'iphone-xs-max': [
    { width: 1242, height: 2688 },
  ],
  'iphone-xr': [
    { width: 828, height: 1792 },
  ],
  'lg-g5': [
    { width: 1440, height: 2560 },
  ],
  'nexus-5x': [
    { width: 1080, height: 1920 },
  ],
  'nexus-6p': [
    { width: 1440, height: 2560 },
  ],
  'nexus-7': [
    { width: 1200, height: 1920 },
  ],
  'nexus-9': [
    { width: 1536, height: 2048 },
  ],
  'one-plus-3': [
    { width: 1080, height: 1920 },
  ],
  'pixel-c': [
    { width: 1800, height: 2560 },
  ],
  'samsung-galaxy-note-5' : [
    { width: 1440, height: 2560 },
  ],
  'samsung-galaxy-note-9' : [
    { width: 1440, height: 2960 },
  ],
  'samsung-galaxy-note-10' : [
    { width: 1080, height: 2280 },
  ],
  'samsung-galaxy-note-10+' : [
    { width: 1440, height: 3040 },
  ],
  'samsung-galaxy-s7, samsung-galaxy-s7-edge': [
    { width: 1440, height: 2560 },
  ],
  'samsung-galaxy-s8, samsung-galaxy-s8+, samsung-galaxy-s9, samsung-galaxy-s9+': [
    { width: 1440, height: 2960 },
  ],
  'samsung-galaxy-tab-10' : [
    { width: 800, height: 1280 },
  ],
  'samsung-galaxy-watch': [
    { width: 360, height: 360 },
  ],
  '16:9h': [
    { width: 3840, height: 2160 },
    { width: 2560, height: 1440 },
  ],
  '16:9': [
    { width: 1920, height: 1080 },
    { width: 1280, height: 720 },
    { width: 960, height: 540 },
    { width: 640, height: 360 },
  ],
  '9:16h': [
    { width: 2160, height: 3840 },
    { width: 1440, height: 2560 },
  ],
  '9:16': [
    { width: 1080, height: 1920 },
    { width: 720, height: 1280 },
    { width: 540, height: 960 },
    { width: 360, height: 640 },
  ],
  '4:3h': [
    { width: 3840, height: 2880 },
    { width: 2560, height: 1920 },
  ],
  '4:3': [
    { width: 1920, height: 1440 },
    { width: 1280, height: 960 },
    { width: 640, height: 480 },
    { width: 320, height: 240 },
  ],
  '3:2h': [
    { width: 3240, height: 2160 },
    { width: 2160, height: 1440 },
  ],
  '3:2': [
    { width: 1920, height: 1280 },
    { width: 1080, height: 720 },
    { width: 720, height: 480 },
    { width: 540, height: 360 },
  ],
  '1:1h': [
    { width: 3840, height: 3840 },
    { width: 2560, height: 2560 },
  ],
  '1:1': [
    { width: 1920, height: 1920 },
    { width: 1280, height: 1280 },
    { width: 640, height: 640 },
    { width: 320, height: 320 },
    { width: 128, height: 128 },
  ],
  'icon': [
    { width: 256, height: 256 },
    { width: 128, height: 128 },
    { width: 64, height: 64 },
    { width: 32, height: 32 },
    { width: 16, height: 16 },
  ],
  'favicon': [
    { width: 512, height: 512, rename: 'android-chrome-512x512.png' },
    { width: 384, height: 384, rename: 'android-chrome-384x384.png' },
    { width: 256, height: 256, rename: 'android-chrome-256x256.png' },
    { width: 192, height: 192, rename: 'android-chrome-192x192.png' },
    { width: 144, height: 144, rename: 'android-chrome-144x144.png' },
    { width: 96, height: 96, rename: 'android-chrome-96x96.png' },
    { width: 72, height: 72, rename: 'android-chrome-72x72.png' },
    { width: 48, height: 48, rename: 'android-chrome-48x48.png' },
    { width: 36, height: 36, rename: 'android-chrome-36x36.png' },

    { width: 180, height: 180, rename: 'apple-touch-icon.png' },

    { width: 180, height: 180, rename: 'favicon.ico' },
    { width: 180, height: 180, rename: 'favicon-16x16.png' },
    { width: 180, height: 180, rename: 'favicon-32x32.png' },

    { width: 310, height: 310, rename: 'mstile-310x310.png' },
    { width: 310, height: 150, rename: 'mstile-310x150.png' },
    { width: 150, height: 150, rename: 'mstile-150x150.png' },
    { width: 144, height: 144, rename: 'mstile-144x144.png' },
    { width: 70, height: 70, rename: 'mstile-70x70.png' },
  ]
}
