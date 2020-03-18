# Responsively Browser

A modified browser built using [Electron](https://www.electronjs.org/) that helps in responsive web development. 

![Screenshot](https://manojvivek.github.io/responsively-app/assets/img/screenshot.png)

## Features
Please visit the website to know more about the application - https://manojvivek.github.io/responsively-app

## Download
The application is available for Mac, Windows and Linux platforms. Please download it from here - https://github.com/manojVivek/responsively-app/releases


## Development
1. Goto `desktop-app` folder
2. Run `yarn dev`. This will start the app for local development with live realoding functionality.

## Distribution
You can build the app for distrbution by runing:
```yarn package-all```

This will build the binaries for all the platforms and place it in the `releases` folder.

If you want to build the binary for a specific platform, run one of the following commands:

**Mac** - ```yarn package-mac```

**Windows(NSIS)** - ```yarn package-win```

**Linux(AppImage)** - ```yarn package-linux```
