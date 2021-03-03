#!/usr/bin/env node

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
const { string } = require('yargs');

/* Macros */
const helpMsg = _ => 'Run \'imager --help\' to see a list of options';

function argvInfo() {
  let flag = false;
  if (argv.resolutions) {
    console.log(Object.keys(resolutions).sort());
    flag = true;
  }
  if (argv['image-types']) {
    console.log(imgFileExts.sort());
    flag = true;
  }

  return flag;
}

function argvCheck() {
  if (argv.r != null && argv.w != null && argv.h != null) {
    console.error('OptionError: Cannot use -r with -w and -h');
    return false;
  }
  else if ((argv.w != null && !argv.h) || (!argv.w && argv.h != null)) {
    console.error('OptionError: -w and -h must be used together');
    return false;
  }
  else if (argv.r != null && argv.r !== 'all' && resolutions[argv.r] === undefined) {
    console.error('OptionError: \'-r ' + argv.r + '\' is not an accepted resolution');
    return false;
  }
  else if (argv.i && !fs.existsSync(argv.i)) {
    console.error('OptionError: \'-i ' + argv.i + '\' is not a file or directory');
    return false;
  }
  else if (argv.i && fs.existsSync(argv.i) && fs.statSync(argv.i).isFile() && !imgFileExts.includes(path.extname(argv.i))) {
    console.error('OptionError: \'-i ' + argv.i + '\' is not an accepted image file extension');
    return false;
  }
  else if (argv.o && argv.o == null) {
    console.error('OptionError: \'-o ' + argv.o + '\' is not a directory');
    return false;
  }
  else if (argv.q && (!parseFloat(argv.q) || parseFloat(argv.q) < 0 || parseFloat(argv.q) > 100)) {
    console.error('OptionError: \'-q ' + argv.q + '\' is not a number in range 0-100');
    return false;
  }
  else if (argv.e && !imgFileExts.includes(argv.e)) {
    console.error('OptionError: \'-e ' + argv.e + '\' is not in the accepted image file extension list:\n' + imgFileExts.join(' '));
    return false;
  }

  return true;
}

function argvPostProcess() {
  if (argv.i) {
    if (fs.statSync(argv.i).isDirectory() && argv.i.charAt(argv.i.length - 1) !== '/') argv.i += '/';
    if (argv.i.slice(0, 2) === './') argv.i = argv.i.substr(2, argv.i.length - 2);
  }
  if (argv.o) {
    if (argv.o.charAt(argv.o.length - 1) !== '/') argv.o += '/';
    if (argv.o.slice(0, 2) === './') argv.o = argv.o.substr(2, argv.o.length - 2);
  }
  return true;
}

function splitBasename(basename) {
  const basenameSplit = basename.split('.');
  let filename = '';
  for (let i = 0; i < basenameSplit.length - 1; i++) filename += basenameSplit[i] + '.';
  return { filename: filename.slice(0, -1), ext: '.' + basenameSplit[basenameSplit.length - 1] };
}

async function resizer(bname, resName, resArr, i=0, srcset='') {
  if (i >= resArr.length) {
    let toDirname = '';
    if (argv.s) {
      if (argv.o)
        toDirname = argv.o + '/' + bname.filename + '/';
      else
        toDirname = bname.filename + '/';
      if (!fs.existsSync(toDirname) || (fs.existsSync(toDirname) && !fs.statSync(toDirname).isDirectory())) fs.mkdirSync(toDirname);
    }
    if (argv.srcset) fs.writeFileSync(toDirname + bname.filename + '.txt', srcset.slice(0, -1));
    return;
  }

  if (argv.o && !fs.existsSync(argv.o) || (fs.existsSync(argv.o) && !fs.statSync(argv.o).isDirectory())) fs.mkdirSync(argv.o);

  let toDirname = '';
  if (argv.s) {
    if (argv.o)
      toDirname = argv.o + '/' + bname.filename + '/';
    else
      toDirname = bname.filename + '/';
    if (!fs.existsSync(toDirname) || (fs.existsSync(toDirname) && !fs.statSync(toDirname).isDirectory())) fs.mkdirSync(toDirname);
  }
  
  let toFilename = bname.filename;
  if (resName.length > 0)
    toFilename += '-' + resName;
  toFilename += '-' + resArr[i].width + 'x' + resArr[i].height;

  let renameBname;
  if (resArr[i].rename !== undefined) {
    renameBname = splitBasename(resArr[i].rename);
    toFilename = renameBname.filename;
  } 

  let toExt = bname.ext;
  if (resArr[i].rename !== undefined) toExt = renameBname.ext;
  if (argv.e) toExt = argv.e;

  if (argv.v) console.log('Creating file \'' + toDirname + toFilename + toExt + '\'')
  return sharp(bname.filename + bname.ext)
    .resize(resArr[i].width, resArr[i].height)
    .toFile(toDirname + toFilename + toExt)
    .then(() => {
      return resizerHelper(bname, resName, resArr, i, srcset, 0, toDirname, toFilename, toExt);
    })
    .catch(err => {
      console.error('SharpError: ' + err);
    })
}

function resizerHelper(bname, resName, resArr, i, srcset, step=0, toDirname, toFilename, toExt) {
  if (step === 0) {
    if (argv.c && toExt !== '.webp') {
      if (argv.v) console.log('compressing ' + toDirname + toFilename + toExt + ' into ' + toExt);
      if (fs.existsSync(toDirname + 'min-' + toFilename + toExt)) fs.unlinkSync(toDirname + 'min-' + toFilename + toExt)
      compress_images( 
        toDirname + toFilename + toExt,
        toDirname + 'min-',
        { compress_force: true, statistic: false, autoupdate: false },
        false,
        { jpg: { engine: "mozjpeg", command: ["-quality", argv.q] } },
        { png: { engine: "pngquant", command: ["--quality=" + argv.q, "-o"] } },
        { svg: { engine: "svgo", command: "--multipass" } },
        { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
        () => {
          if (argv.clean && !(argv.p || (argv.c && toExt === '.webp'))) fs.unlinkSync(toDirname + toFilename + toExt);
          return resizerHelper(bname, resName, resArr, i, srcset, 1, toDirname, toFilename, toExt)
        }
      );
    } else {
      return resizerHelper(bname, resName, resArr, i, srcset, 1, toDirname, toFilename, toExt)
    }
  }

  if (step === 1) {
    if (argv.p || (argv.c && toExt === '.webp')) {
      if (argv.v) console.log('compressing ' + toDirname + toFilename + toExt + ' into .webp');
      if (fs.existsSync(toDirname + 'min-' + toFilename + '.webp')) fs.unlinkSync(toDirname + 'min-' + toFilename + '.webp')
      compress_images(
        toDirname + toFilename + toExt,
        toDirname + 'min-',
        { compress_force: true, statistic: false, autoupdate: false },
        false,
        { jpg: { engine: "webp", command: false } },
        { png: { engine: "webp", command: false } },
        { svg: { engine: false, command: false } },
        { gif: { engine: false, command: false } },
        () => {
          if (argv.clean) fs.unlinkSync(toDirname + toFilename + toExt);
          return resizerHelper(bname, resName, resArr, i, srcset, 2, toDirname, toFilename, toExt)
        }
      );
    }
    else {
      return resizerHelper(bname, resName, resArr, i, srcset, 2, toDirname, toFilename, toExt)
    }
  } 

  if (step === 2) {
    
    return resizer(bname, resName, resArr, i+1, calcSrcset(bname, resName, resArr, i, srcset));
  }
}

function calcSrcset(bname, resName, resArr, i, srcset) {
  if (argv.srcset) {
    let srcsetPrefix = ''
    srcsetPrefix += argv.srcset;
    if (argv.s) {
      if (argv.srcset.charAt(argv.srcset.length - 1) !== '/' && argv.srcset.length > 0) srcsetPrefix += '/'
      if (argv['srcset-var']) srcsetPrefix += '\'+' + argv['srcset-var'] + '+\'/';
      else srcsetPrefix += bname.filename + '/';
    }
    let newFilename = toFilename;
    if (argv['srcset-var']) newFilename = '\'+' + argv['srcset-var'] + '+\'';
    
    if (argv.srcset && (argv.p || (argv.c && toExt === '.webp')))
      srcset += srcsetPrefix + 'min-' + newFilename + '-' +
      resName + '-' + resArr[i].width + 'x' + resArr[i].height +
      toExt + ' ' + resArr[i].width + 'w,';
    
    if (argv.srcset && (argv.c && toExt !== '.webp'))
      srcset += srcsetPrefix + 'min-' + newFilename + '-' +
      resName + '-' + resArr[i].width + 'x' + resArr[i].height +
      toExt + ' ' + resArr[i].width + 'w,';
    
    if (((argv.c && toExt !== '.webp') || (argv.p || (argv.c && toExt === '.webp'))) && argv.srcset)
      srcset += srcsetPrefix + newFilename + '-' + resName + '-' +
      resArr[i].width + 'x' + resArr[i].height + toExt + ' ' +
      resArr[i].width + 'w,';
  }
  return srcset;
}

function getAllImgs(imgs, dir='./') {
  fs.readdirSync(dir).forEach(file => {
    if (imgFileExts.includes(path.extname(file))) imgs.push(dir + file);
  })
}

function main() {
  const imgs = [];
  const stat = fs.statSync('./' + argv.i);

  /* Getting input file/directory */
  if (stat.isFile()) imgs.push('./' + argv.i);
  else getAllImgs(imgs, './' + argv.i);

  /* Verbose output */
  if (argv.v) console.log('Found ' + imgs.length + ' images to resize');
  if (argv.v && argv.r) console.log('Resizing image(s) into ' + argv.r + ' aspect ratio(s)');
  else if (argv.v) console.log('Resizing image(s) to ' + argv.w + 'x' + argv.h);

  /* Resizing and converting or just converting image */
  if (argv.r) {
    if (argv.r === 'all') {
      imgs.forEach(img => {
        Object.keys(resolutions).forEach(async (k) => {
          await resizer(splitBasename(path.basename(img)), k, resolutions[k])
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
    imgs.forEach(async (img) => {
      await resizer(splitBasename(path.basename(img)), 'custom', [{ width: argv.w, height: argv.h }]);
    });
  }
  else if (argv.e) {
    imgs.forEach(async (img) => {
      const dims = sizeOf(img);
      resizer(splitBasename(path.basename(img)), '', [{ width: dims.width, height: dims.height }]);
    });
  }

}

const displayedInfo = argvInfo();
const argsGood = argvCheck(displayedInfo);
argvPostProcess();
if (argsGood && (argv.r || (argv.w && argv.h) || argv.e)) main();
else {
  if (!argsGood) console.log();
  console.log(helpMsg());
}
