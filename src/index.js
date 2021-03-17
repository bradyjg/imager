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

/* Packages */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
sharp.cache(false);
const compress_images = require("compress-images");
const sizeOf = require('image-size');

/* Process constants */
const argv = require('yargs/yargs')(process.argv.slice(2))
.options({
  resolutions: {
    description: 'Lists all accepted resolutions',
    type: 'boolean',
  },
  'image-types': {
    description: 'Lists all accepted image types',
    type: 'boolean',
  },
  resolution: {
    alias: 'r',
    description: 'Resolution class for resizing',
    type: 'string',
  },
  width: {
    alias: 'w',
    description: 'Custom width of output image',
    type: 'number',
  },
  height: {
    alias: 'h',
    description: 'Custom height of output image',
    type: 'number',
  },
  input: {
    alias: 'i',
    description: 'Input file or directory',
    type: 'string',
  },
  output: {
    alias: 'o',
    description: 'Output directory',
    type: 'string',
  },
  extension: {
    alias: 'e',
    description: 'Extension of the output image',
    type: 'string',
  },
  compress: {
    alias: 'c',
    description: 'Compress images after resizing',
    type: 'boolean',
  },
  quality: {
    alias: 'q',
    description: 'Quality of .jpg and .png compression (0-100)',
    type: 'number',
  },
  webp: {
    alias: 'p',
    description: 'Convert resized .jpg, .jpeg, and .png into .webp for Chrome browsers',
    type: 'boolean',
  },
  srcset: {
    description: 'Generates the HTML for the \'srcset\' attribute for an image with prefix directory given',
    type: 'string',
  },
  'srcset-var': {
    description: 'A name a variable instead of the image basename',
    type: 'string',
  },
  separate: {
    alias: 's',
    description: 'Separate resized images into their own folders per original image',
    type: 'boolean',
  },
  clean: {
    description: 'Cleans up original image files after compression',
    type: 'boolean',
  },
  verbose: {
    alias: 'v',
    description: 'Show verbose output to the console',
    type: 'boolean',
  },
})
.default('input', './')
.default('output', '')
.default('quality', 100)
.example('$0 -i ./image.jpg -r 16:9', 'get 4 standard resized images of "image.jpg" in aspect ratio 16:9')
.example('$0 -r google-pixel-4-xl', 'resize all images in current directory to fit the Google Pixel 4 XL')
.epilog('Copyright Brady Geleynse 2021')
.help()
.argv;

/* Local utils */
const postProcess = require('./utils/post-process');

/* Local constants */
const resolutions = postProcess.expand(require('./objects/resolutions'));
const imgFileExts = require('./arrays/accepted-img-exts');

/* Macros */
const helpMsg = _ => 'Run \'imager --help\' to see a list of options';

/**
 * @summary Displays requested information to the user
 * @returns { Boolean } Wether display information was requested
 */
function argvInfo() {
  let flag = false;
  /** Display accepted resolutions */
  if (argv.resolutions) {
    console.log(Object.keys(resolutions).sort());
    flag = true;
  }
  /** Display accepted image types */
  if (argv['image-types']) {
    console.log(imgFileExts.sort());
    flag = true;
  }

  return flag;
}

/**
 * @summary Validates command arguments
 * @returns { Boolean } If there is an error with the passed arguments
 */
function argvCheck() {
  /** If resolution, width, and height are not given */
  if (argv.r != null && argv.w != null && argv.h != null) {
    console.error('OptionError: Cannot use -r with -w and -h');
    return false;
  }
  /** If width is given without height or vice versa */
  else if ((argv.w != null && !argv.h) || (!argv.w && argv.h != null)) {
    console.error('OptionError: -w and -h must be used together');
    return false;
  }
  /** If a resoultion is given but does not exist */
  else if (argv.r != null && argv.r !== 'all' && resolutions[argv.r] === undefined) {
    console.error('OptionError: \'-r ' + argv.r + '\' is not an accepted resolution');
    return false;
  }
  /** If and input file or directory is given but does not exist or is null */
  else if (argv.i && argv.i != null && !fs.existsSync(argv.i)) {
    console.error('OptionError: \'-i ' + argv.i + '\' is not a file or directory');
    return false;
  }
  /** If an input file is given, but it is not an accepted extension */
  else if (argv.i && fs.existsSync(argv.i) && fs.statSync(argv.i).isFile() && !imgFileExts.includes(path.extname(argv.i))) {
    console.error('OptionError: \'-i ' + argv.i + '\' is not an accepted image file extension');
    return false;
  }
  /** If an output is given, but it is null */
  else if (argv.o && argv.o == null) {
    console.error('OptionError: \'-o ' + argv.o + '\' is not a directory');
    return false;
  }
  /** If a compression quality is given out of range or is not a number */
  else if (argv.q && (!parseFloat(argv.q) || parseFloat(argv.q) < 0 || parseFloat(argv.q) > 100)) {
    console.error('OptionError: \'-q ' + argv.q + '\' is not a number in range 0-100');
    return false;
  }
  /** If the new image extension is not an accepted extension */
  else if (argv.e && !imgFileExts.includes(argv.e)) {
    console.error('OptionError: \'-e ' + argv.e + '\' is not in the accepted image file extension list:\n' + imgFileExts.join(' '));
    return false;
  }

  return true;
}

/**
 * @summary Formats dirty inputs and makes sure everything is ready for processing
 */
function argvPostProcess() {
  /** Makes sure that the input string is formatted correctly for the program */
  if (argv.i) {
    if (fs.statSync(argv.i).isDirectory() && argv.i.charAt(argv.i.length - 1) !== '/') argv.i += '/';
    if (argv.i.slice(0, 2) === './') argv.i = argv.i.substr(2, argv.i.length - 2);
  }

  /** Makes sure that the output string is formatted correctly for the program */
  if (argv.o) {
    if (argv.o.charAt(argv.o.length - 1) !== '/') argv.o += '/';
    if (argv.o.slice(0, 2) === './') argv.o = argv.o.substr(2, argv.o.length - 2);
  }

  /** If output directory does not exist or if it is a file, not a directory, create the output directory */
  if (argv.o && (!fs.existsSync(argv.o) || (fs.existsSync(argv.o) && !fs.statSync(argv.o).isDirectory())))
    fs.mkdirSync(argv.o);
}

/**
 * @summary Splits a full basename into the file name and file extension
 * @param { String } bname Basename of a file
 * @returns { Object } A split version of the basename
 */
function splitBasename(bname) {
  const bnameSplit = bname.split('.');
  let fname = '';
  for (let i = 0; i < bnameSplit.length - 1; i++) fname += bnameSplit[i] + '.';
  return { fname: fname.slice(0, -1), ext: '.' + bnameSplit[bnameSplit.length - 1] };
}

/**
 * @summary 
 * @param { String } bname   Basename of input file
 * @param { String } resName Resolution name ex: 16:9
 * @param { Array }  resArr  Array of resolutions
 * @param { Number } i       Index of resArr
 * @param { String } srcset  Compounded srcset string
 * @param { String } dname Directory of output file
 * @returns First step in compression process
 */
function resizer(bname, resName, resArr, i=0, srcset='', dname) {
  /** Basecase - Writes srcset if enabled and returns */
  if (i >= resArr.length) {
    if (argv.srcset)
      fs.writeFileSync(dname + bname.fname + '.txt', srcset.slice(0, -1));
    return;
  }

  /** Sets path for output directory and creates folder is separate is enabled */
  if (dname === undefined) {
    dname = './';
    if (argv.s) {
      if (argv.o)
        dname = argv.o + '/' + bname.fname + '/';
      else
        dname = bname.fname + '/';
      if (!fs.existsSync(dname) || (fs.existsSync(dname) && !fs.statSync(dname).isDirectory()))
        fs.mkdirSync(dname);
    }
  }

  /** Sets up file name and extension for output file */
  let fname;
  let ext = bname.ext;
  if (resArr[i].rename === undefined) {
    fname = bname.fname;

    if (resName.length > 0)
      fname += '-' + resName;
    fname += '-' + resArr[i].width + 'x' + resArr[i].height;
    
    if (argv.e)
      ext = argv.e;
  }
  /** Overrides default naming schema is applicable */
  else {
    const renameBname = splitBasename(resArr[i].rename);
    fname = renameBname.fname;
    ext = renameBname.ext;
  }
  
  /** Verbose output */
  if (argv.v) console.log('Creating file \'' + dname + fname + ext + '\'');

  return sharp(bname.fname + bname.ext)
    .resize(resArr[i].width, resArr[i].height)
    .toFile(dname + fname + ext)
    .then(() => {
      return compress(bname, resName, resArr, i, srcset, dname, fname, ext);
    })
    .catch(err => {
      console.error('SharpError: ' + err);
    })
}

/**
 * @summary Compresses all accepted image types except .webp
 * @param { String } bname   Basename of input file
 * @param { String } resName Resolution name ex: 16:9
 * @param { Array }  resArr  Array of resolutions
 * @param { Number } i       Index of resArr
 * @param { String } srcset  Compounded srcset string
 * @param { String } dname   Directory of output file
 * @param { String } fname   Filename of output file
 * @param { String } ext     Extension of file
 * @returns { Function } Next step in the compression procedure
 */
function compress(bname, resName, resArr, i, srcset, dname, fname, ext) {
  if (argv.c && ext !== '.webp') {
    /** Verbose output */
    if (argv.v) console.log('compressing ' + dname + fname + ext + ' into ' + ext);

    /** Remove file for overwriting purposes */
    if (fs.existsSync(dname + 'min-' + fname + ext))
      fs.unlinkSync(dname + 'min-' + fname + ext);

    /** Compress into same extension */
    compress_images( 
      dname + fname + ext,
      dname + 'min-',
      { compress_force: true, statistic: false, autoupdate: false },
      false,
      { jpg: { engine: "mozjpeg", command: ["-quality", argv.q] } },
      { png: { engine: "pngquant", command: ["--quality=" + argv.q, "-o"] } },
      { svg: { engine: "svgo", command: "--multipass" } },
      { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
      () => {
        /** If clean is enabled, remove uncompressed resized file */
        if (argv.clean && !(argv.p || (argv.c && ext === '.webp')))
          fs.unlinkSync(dname + fname + ext);

        return toWebp(bname, resName, resArr, i, srcset, dname, fname, ext);
      }
    );
  } else {
    return toWebp(bname, resName, resArr, i, srcset, dname, fname, ext);
  }
}

/**
 * @summary Creates a compressed .webp image file.
 * @param { String } bname   Basename of input file
 * @param { String } resName Resolution name ex: 16:9
 * @param { Array }  resArr  Array of resolutions
 * @param { Number } i       Index of resArr
 * @param { String } srcset  Compounded srcset string
 * @param { String } dname   Directory of output file
 * @param { String } fname   Filename of output file
 * @param { String } ext     Extension of file
 * @returns { Function } End of procedure, so it returns the recursive call to resizer() with next index value of i
 */
function toWebp(bname, resName, resArr, i, srcset, dname, fname, ext) {
  if (argv.p || (argv.c && ext === '.webp')) {
    /** Verbose output */
    if (argv.v) console.log('compressing ' + dname + fname + ext + ' into .webp');

    /** Remove file for overwriting purposes */
    if (fs.existsSync(dname + 'min-' + fname + '.webp'))
      fs.unlinkSync(dname + 'min-' + fname + '.webp')

    /** Compress into .webp */
    compress_images(
      dname + fname + ext,
      dname + 'min-',
      { compress_force: true, statistic: false, autoupdate: false },
      false,
      { jpg: { engine: "webp", command: false } },
      { png: { engine: "webp", command: false } },
      { svg: { engine: false, command: false } },
      { gif: { engine: false, command: false } },
      () => {
        /** If clean is enabled, remove uncompressed resized file */
        if (argv.clean)
          fs.unlinkSync(dname + fname + ext);

        /** Calculate srcset if enabled */
        if (argv.srcset)
          srcset = calcSrcset(bname, resName, resArr, i, srcset, fname, ext);

        return resizer(bname, resName, resArr, i+1, srcset, dname);
      }
    );
  }
  else {
    /** Calculate srcset if enabled */
    if (argv.srcset)
      srcset = calcSrcset(bname, resName, resArr, i, srcset, fname, ext);

    return resizer(bname, resName, resArr, i+1, srcset, dname);
  }
}

/**
 * @summary If srcset is enabled, the srcset string is calculated for the current image and appended.
 * @param { String } bname   Basename of input file
 * @param { String } resName Resolution name ex: 16:9
 * @param { Array }  resArr  Array of resolutions
 * @param { Number } i       Index of resArr
 * @param { String } srcset  Compounded srcset string
 * @param { String } fname   Filename of output file
 * @param { String } ext     Extension of file
 * @returns { String } Returns the newly compounded srcset string
 */
function calcSrcset(bname, resName, resArr, i, srcset, fname, ext) {
  /** Setting up srcset prefix */
  let srcsetPrefix = ''
  srcsetPrefix += argv.srcset;
  if (argv.s) {
    if (argv.srcset.charAt(argv.srcset.length - 1) !== '/' && argv.srcset.length > 0)
      srcsetPrefix += '/'

    if (argv['srcset-var'])
      srcsetPrefix += '\'+' + argv['srcset-var'] + '+\'/';
    else srcsetPrefix += bname.fname + '/';
  }

  /** Change filename prefix if compression is enabled */
  if (argv.c)
    srcsetPrefix += 'min-';

  /** Checking if srcset-var is enabled */
  let newFilename = fname;
  if (argv['srcset-var'])
    newFilename = '\'+' + argv['srcset-var'] + '+\'-' + resName + '-' + resArr[i].width + 'x' + resArr[i].height;
  
  /** Check if creating .webp files */
  if (argv.p && ext !== '.webp')
    srcset += srcsetPrefix + newFilename + '.webp ' + resArr[i].width + 'w,';

  /** Append srcset string and return*/
  return srcset + srcsetPrefix + newFilename + ext + ' ' + resArr[i].width + 'w,';
}

/**
 * @summary Gets the name of all images inside of a directory.
 * @param { Array } imgs Array to put image names, passed by reference
 * @param { String } dir Directory to get image names from 
 */
function getAllImgs(imgs, dir='./') {
  fs.readdirSync(dir).forEach(file => {
    if (imgFileExts.includes(path.extname(file))) imgs.push(dir + file);
  })
}

/**
 * @summary Main loop
 */
function main() {
  const imgs = [];
  const stat = fs.statSync('./' + argv.i);

  /* Getting input file/directory */
  if (stat.isFile())
    imgs.push('./' + argv.i);
  else
    getAllImgs(imgs, './' + argv.i);

  /* Verbose output */
  if (argv.v) console.log('Found ' + imgs.length + ' images to resize');
  if (argv.v && argv.r) console.log('Resizing image(s) into ' + argv.r + ' aspect ratio(s)');
  else if (argv.v) console.log('Resizing image(s) to ' + argv.w + 'x' + argv.h);

  /* Resizing and converting or just converting image */
  if (argv.r) {
    if (argv.r === 'all') {
      imgs.forEach(img => {
        Object.keys(resolutions).forEach(() => {
          resizer(splitBasename(path.basename(img)), k, resolutions[k])
        });
      });
    }
    else {
      imgs.forEach((img) => {
        resizer(splitBasename(path.basename(img)), argv.r, resolutions[argv.r]);
      });
    }
  }
  else if (argv.w && argv.h) {
    imgs.forEach((img) => {
      resizer(splitBasename(path.basename(img)), 'custom', [{ width: argv.w, height: argv.h }]);
    });
  }
  else if (argv.e) {
    imgs.forEach((img) => {
      const dims = sizeOf(img);
      resizer(splitBasename(path.basename(img)), '', [{ width: dims.width, height: dims.height }]);
    });
  }

}

/** Setup functions */
const displayedInfo = argvInfo();
const validArgs = argvCheck(displayedInfo);
argvPostProcess();

/** Main loop */
if (validArgs && (argv.r || (argv.w && argv.h) || argv.e))
  main();
else {
  if (!validArgs) console.log();
  console.log(helpMsg());
}
