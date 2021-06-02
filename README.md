# Imager - v1.0.4

## Purpose
The original purpose of this program was to programatically create optimized images in specific aspect ratios for web development.

## Requirements
Node.js - https://nodejs.org/en/download/

The following command requires ```sudo``` permissions on Linux.
  * ```npm link``` - *Required to call* ```imager``` *as alias from command line instead of running* ```./index.js```

## Dependencies
| Name | Version | License | Link |
| --- | --- | --- | --- |
| gulp-cli | 2.3.0 | MIT | https://www.npmjs.com/package/gulp-cli |
| compress-images | 1.9.8 | MIT | https://www.npmjs.com/package/compress-images |
| gifsicle | 5.2.0 | MIT | https://www.npmjs.com/package/gifsicle |
| image-size | 0.9.4 | MIT | https://www.npmjs.com/package/image-size |
| pngquant-bin | 6.0.0 | GPL-3.0+ | https://www.npmjs.com/package/pngquant-bin |
| sharp | 0.27.2 | Apache 2.0 | https://www.npmjs.com/package/sharp |
| yargs | 16.2.0 | MIT | https://www.npmjs.com/package/yargs |

## Credits
| Name | Source | Author | License | 
| --- | --- | --- | --- |
| test-img.png | https://openclipart.org/detail/304895/resize-icon | krypt | CC0 1.0 |

## Install
  1. Navigate to repository root
  2. ```npm install```
   
## Documentation
  | Flag/Option | Description | Type | Default |
  | --- | --- | --- | --- |
  | ```--version```| Show version number | Boolean | False |
  | ```--resolutions``` | Lists all accepted resolutions | Boolean | False |
  | ```--image-types``` | Lists all accepted image types | Boolean | False |
  | ```-r```, ```--resolution``` | Resolution class for resizing | String | Null |
  | ```-w```, ```--width``` | Custom width of output image | Number | NaN |
  | ```-h```, ```--height``` | Custom height of output image | Number | NaN |
  | ```-i```, ```--input``` | Input file or directory | String | ./ |
  | ```-o```, ```--output``` | Output directory | String | ./ |
  | ```-e```, ```--extension``` | Custom extension of the output images | String | Null |
  | ```-c```, ```--compress``` | Compress the images after resizing | Boolean | False |
  | ```-q```, ```--quality``` | Quality of .jpg and .png compression (0-100) | Number | 100 |
  | ```-p```, ```--webp``` | Output .webp versions of .jpg, .jpeg, and .png files | Boolean | False |
  | ```--srcset``` | Generates a string to be used in ```<img srcset=''>``` with a folder prefix passed through this option | String | Null |
  | ```--srcset-var``` | Replace the filename with this variable name | String | Null |
  | ```-s```, ```--separate``` | Resized images get put into a directory named after it's parent file | Boolean | False |
  | ```--clean``` | Cleans up original resized image after compression | Boolean | False |
  | ```-v```, ```--verbose``` | Write verbose output to stdout | Boolean | False |
  | ```--help``` | Show help | Boolean | False |

## Usage
It is recommended to navigate to your directory of images and run **imager** there.

Common use cases:
  * Resize images, create .webp versions, compress, and create srcset string for web development
  * Create different icon sizes for a square image
  * Create favicon sizes of your logo

## Examples
### Create icon sized images
```imager -r icon -i icon.png```

This command will create a range of images from **icon.png** ```-i icon.png```. The resulting images will be sized from **512x512** to **16x16** ```-r icon```, halving dimensions each iteration.

### Create standard 16:9 images for a webpage slider
```imager -r 16:9 -s -p -c -q 80 --srcset imgs --srcset-var img.src```

This command will create 4 standard **16:9** images ```-r 16:9``` of every image in the current directory and place them in their **own directory** ```-s```. Then, it will create **.webp** versions of the images if applicable ```-p```. Next, it will **compress** the images ```-c``` (.jpg, .jpeg, and .png will be compressed to 80% quality ```-q 80```). Finally, a **srcset** string is created in the **\<filename\>.txt** with the image path prefix **imgs/** ```--srcset imgs``` and replaces the file name in srcset with the variable name **img.src** ```--srcset-var img.src``` to paste into an \<img srcset=" "\>. This will allow for dynamically served images based on the client's device width and improve network performance for your page.

### Create a custom sized image
```imager -w 1000 -h 1000 -e .jpg```

This command will create a **1000x1000** image ```-w 1000 -h 1000``` for each image in the current directory and convert them to **.jpg** files ```-e .jpg``` if they are not already.