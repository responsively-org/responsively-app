# Responsively Browser
website: https://github.com/manojVivek/responsively-app

A modified browser built using [Electron](https://www.electronjs.org/) that helps in responsive web development. 

![Screenshot](https://manojvivek.github.io/responsively-app/assets/img/screenshot.png)

## Features
1. Mirrored User-interactions across all devices.
2. Customizable preview layout to suit all your needs.
3. One handy elements inspector for all devices in preview.
4. 30+ built-in device profiles with option to add custom devices.
5. One-click screenshot all your devices.
6. Hot reloading supported for developers.

Please visit the website to know more about the application - https://manojvivek.github.io/responsively-app

## Download
The application is available for Mac, Windows and Linux platforms. Please download it from here - https://github.com/manojVivek/responsively-app/releases

## Issues
If you face any problems while using the application, please open an issue here - https://github.com/manojVivek/responsively-app/issues

## Contribute
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
