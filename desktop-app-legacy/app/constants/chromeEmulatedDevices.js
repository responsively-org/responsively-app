// https://cs.chromium.org/codesearch/f/chromium/src/third_party/blink/renderer/devtools/front_end/emulated_devices/module.json
// https://source.chromium.org/chromium/chromium/src/+/master:third_party/devtools-frontend/src/front_end/emulated_devices/module.json?q=emulated_devices%2Fmodule.json&ss=chromium

export default {
  extensions: [
    {
      id: '1',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'iPhone 4',
        screen: {
          horizontal: {
            width: 480,
            height: 320,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 320,
            height: 480,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_2 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D257 Safari/9537.53',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '2',
      type: 'emulated-device',
      order: 30,
      device: {
        'show-by-default': false,
        title: 'iPhone 5/SE',
        screen: {
          horizontal: {
            outline: {
              image: '@url(iPhone5-landscape.svg)',
              insets: {
                left: 115,
                top: 25,
                right: 115,
                bottom: 28,
              },
            },
            width: 568,
            height: 320,
          },
          'device-pixel-ratio': 2,
          vertical: {
            outline: {
              image: '@url(iPhone5-portrait.svg)',
              insets: {
                left: 29,
                top: 105,
                right: 25,
                bottom: 111,
              },
            },
            width: 320,
            height: 568,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '3',
      type: 'emulated-device',
      order: 31,
      device: {
        'show-by-default': false,
        title: 'iPhone 6/7/8',
        screen: {
          horizontal: {
            outline: {
              image: '@url(iPhone6-landscape.svg)',
              insets: {
                left: 106,
                top: 28,
                right: 106,
                bottom: 28,
              },
            },
            width: 667,
            height: 375,
          },
          'device-pixel-ratio': 2,
          vertical: {
            outline: {
              image: '@url(iPhone6-portrait.svg)',
              insets: {
                left: 28,
                top: 105,
                right: 28,
                bottom: 105,
              },
            },
            width: 375,
            height: 667,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '4',
      type: 'emulated-device',
      order: 32,
      device: {
        'show-by-default': false,
        title: 'iPhone 6/7/8 Plus',
        screen: {
          horizontal: {
            outline: {
              image: '@url(iPhone6Plus-landscape.svg)',
              insets: {
                left: 109,
                top: 29,
                right: 109,
                bottom: 27,
              },
            },
            width: 736,
            height: 414,
          },
          'device-pixel-ratio': 3,
          vertical: {
            outline: {
              image: '@url(iPhone6Plus-portrait.svg)',
              insets: {
                left: 26,
                top: 107,
                right: 30,
                bottom: 111,
              },
            },
            width: 414,
            height: 736,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '5',
      type: 'emulated-device',
      order: 33,
      device: {
        'show-by-default': true,
        title: 'iPhone X',
        screen: {
          horizontal: {
            width: 812,
            height: 375,
          },
          'device-pixel-ratio': 3,
          vertical: {
            width: 375,
            height: 812,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '6',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'BlackBerry Z30',
        screen: {
          horizontal: {
            width: 640,
            height: 360,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 360,
            height: 640,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '7',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Nexus 4',
        screen: {
          horizontal: {
            width: 640,
            height: 384,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 384,
            height: 640,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '8',
      type: 'emulated-device',
      device: {
        title: 'Nexus 5',
        type: 'phone',
        'user-agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36',
        capabilities: ['touch', 'mobile'],
        'show-by-default': false,
        screen: {
          'device-pixel-ratio': 3,
          vertical: {
            width: 360,
            height: 640,
          },
          horizontal: {
            width: 640,
            height: 360,
          },
        },
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 25, right: 0, bottom: 48},
            image:
              '@url(google-nexus-5-vertical-default-1x.png) 1x, @url(google-nexus-5-vertical-default-2x.png) 2x',
          },
          {
            title: 'navigation bar',
            orientation: 'vertical',
            insets: {left: 0, top: 80, right: 0, bottom: 48},
            image:
              '@url(google-nexus-5-vertical-navigation-1x.png) 1x, @url(google-nexus-5-vertical-navigation-2x.png) 2x',
          },
          {
            title: 'keyboard',
            orientation: 'vertical',
            insets: {left: 0, top: 80, right: 0, bottom: 312},
            image:
              '@url(google-nexus-5-vertical-keyboard-1x.png) 1x, @url(google-nexus-5-vertical-keyboard-2x.png) 2x',
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 25, right: 42, bottom: 0},
            image:
              '@url(google-nexus-5-horizontal-default-1x.png) 1x, @url(google-nexus-5-horizontal-default-2x.png) 2x',
          },
          {
            title: 'navigation bar',
            orientation: 'horizontal',
            insets: {left: 0, top: 80, right: 42, bottom: 0},
            image:
              '@url(google-nexus-5-horizontal-navigation-1x.png) 1x, @url(google-nexus-5-horizontal-navigation-2x.png) 2x',
          },
          {
            title: 'keyboard',
            orientation: 'horizontal',
            insets: {left: 0, top: 80, right: 42, bottom: 202},
            image:
              '@url(google-nexus-5-horizontal-keyboard-1x.png) 1x, @url(google-nexus-5-horizontal-keyboard-2x.png) 2x',
          },
        ],
      },
    },
    {
      id: '9',
      type: 'emulated-device',
      device: {
        title: 'Nexus 5X',
        type: 'phone',
        'user-agent':
          'Mozilla/5.0 (Linux; Android 8.0.0; Nexus 5X Build/OPR4.170623.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36',
        capabilities: ['touch', 'mobile'],
        'show-by-default': false,
        screen: {
          'device-pixel-ratio': 2.625,
          vertical: {
            outline: {
              image: '@url(Nexus5X-portrait.svg)',
              insets: {left: 18, top: 88, right: 22, bottom: 98},
            },
            width: 412,
            height: 732,
          },
          horizontal: {
            outline: {
              image: '@url(Nexus5X-landscape.svg)',
              insets: {left: 88, top: 21, right: 98, bottom: 19},
            },
            width: 732,
            height: 412,
          },
        },
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 24, right: 0, bottom: 48},
            image:
              '@url(google-nexus-5x-vertical-default-1x.png) 1x, @url(google-nexus-5x-vertical-default-2x.png) 2x',
          },
          {
            title: 'navigation bar',
            orientation: 'vertical',
            insets: {left: 0, top: 80, right: 0, bottom: 48},
            image:
              '@url(google-nexus-5x-vertical-navigation-1x.png) 1x, @url(google-nexus-5x-vertical-navigation-2x.png) 2x',
          },
          {
            title: 'keyboard',
            orientation: 'vertical',
            insets: {left: 0, top: 80, right: 0, bottom: 342},
            image:
              '@url(google-nexus-5x-vertical-keyboard-1x.png) 1x, @url(google-nexus-5x-vertical-keyboard-2x.png) 2x',
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 24, right: 48, bottom: 0},
            image:
              '@url(google-nexus-5x-horizontal-default-1x.png) 1x, @url(google-nexus-5x-horizontal-default-2x.png) 2x',
          },
          {
            title: 'navigation bar',
            orientation: 'horizontal',
            insets: {left: 0, top: 80, right: 48, bottom: 0},
            image:
              '@url(google-nexus-5x-horizontal-navigation-1x.png) 1x, @url(google-nexus-5x-horizontal-navigation-2x.png) 2x',
          },
          {
            title: 'keyboard',
            orientation: 'horizontal',
            insets: {left: 0, top: 80, right: 48, bottom: 222},
            image:
              '@url(google-nexus-5x-horizontal-keyboard-1x.png) 1x, @url(google-nexus-5x-horizontal-keyboard-2x.png) 2x',
          },
        ],
      },
    },
    {
      id: '10',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Nexus 6',
        screen: {
          horizontal: {
            width: 732,
            height: 412,
          },
          'device-pixel-ratio': 3.5,
          vertical: {
            width: 412,
            height: 732,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; Android 7.1.1; Nexus 6 Build/N6F26U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '11',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Nexus 6P',
        screen: {
          horizontal: {
            outline: {
              image: '@url(Nexus6P-landscape.svg)',
              insets: {left: 94, top: 17, right: 88, bottom: 17},
            },
            width: 732,
            height: 412,
          },
          'device-pixel-ratio': 3.5,
          vertical: {
            outline: {
              image: '@url(Nexus6P-portrait.svg)',
              insets: {left: 16, top: 94, right: 16, bottom: 88},
            },
            width: 412,
            height: 732,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; Android 8.0.0; Nexus 6P Build/OPP3.170518.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '12',
      type: 'emulated-device',
      order: 20,
      device: {
        'show-by-default': false,
        title: 'Pixel 2',
        screen: {
          horizontal: {
            width: 731,
            height: 411,
          },
          'device-pixel-ratio': 2.625,
          vertical: {
            width: 411,
            height: 731,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '13',
      type: 'emulated-device',
      order: 21,
      device: {
        'show-by-default': false,
        title: 'Pixel 2 XL',
        screen: {
          horizontal: {
            width: 823,
            height: 411,
          },
          'device-pixel-ratio': 3.5,
          vertical: {
            width: 411,
            height: 823,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '14',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'LG Optimus L70',
        screen: {
          horizontal: {
            width: 640,
            height: 384,
          },
          'device-pixel-ratio': 1.25,
          vertical: {
            width: 384,
            height: 640,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; LGMS323 Build/KOT49I.MS32310c) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/%s Mobile Safari/537.36',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '15',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Nokia N9',
        screen: {
          horizontal: {
            width: 854,
            height: 480,
          },
          'device-pixel-ratio': 1,
          vertical: {
            width: 480,
            height: 854,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (MeeGo; NokiaN9) AppleWebKit/534.13 (KHTML, like Gecko) NokiaBrowser/8.5.0 Mobile Safari/534.13',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '16',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Nokia Lumia 520',
        screen: {
          horizontal: {
            width: 533,
            height: 320,
          },
          'device-pixel-ratio': 1.5,
          vertical: {
            width: 320,
            height: 533,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 520)',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '17',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Microsoft Lumia 550',
        screen: {
          horizontal: {
            width: 640,
            height: 360,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 640,
            height: 360,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 550) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/14.14263',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '18',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Microsoft Lumia 950',
        screen: {
          horizontal: {
            width: 640,
            height: 360,
          },
          'device-pixel-ratio': 4,
          vertical: {
            width: 360,
            height: 640,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/14.14263',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '19',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Galaxy S III',
        screen: {
          horizontal: {
            width: 640,
            height: 360,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 360,
            height: 640,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; U; Android 4.0; en-us; GT-I9300 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '20',
      type: 'emulated-device',
      order: 10,
      device: {
        'show-by-default': false,
        title: 'Galaxy S5',
        screen: {
          horizontal: {
            width: 640,
            height: 360,
          },
          'device-pixel-ratio': 3,
          vertical: {
            width: 360,
            height: 640,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '21',
      type: 'emulated-device',
      order: 1,
      device: {
        'show-by-default': false,
        title: 'JioPhone 2',
        screen: {
          horizontal: {
            width: 320,
            height: 240,
          },
          'device-pixel-ratio': 1,
          vertical: {
            width: 240,
            height: 320,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Mobile; LYF/F300B/LYF-F300B-001-01-15-130718-i;Android; rv:48.0) Gecko/48.0 Firefox/48.0 KAIOS/2.5',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '22',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Kindle Fire HDX',
        screen: {
          horizontal: {
            width: 1280,
            height: 800,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 800,
            height: 1280,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; U; en-us; KFAPWI Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Silk/3.13 Safari/535.19 Silk-Accelerated=true',
        type: 'tablet',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '23',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'iPad Mini',
        screen: {
          horizontal: {
            width: 1024,
            height: 768,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 768,
            height: 1024,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
        type: 'tablet',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '24',
      type: 'emulated-device',
      order: 40,
      device: {
        'show-by-default': true,
        title: 'iPad',
        screen: {
          horizontal: {
            outline: {
              image: '@url(iPad-landscape.svg)',
              insets: {
                left: 112,
                top: 56,
                right: 116,
                bottom: 52,
              },
            },
            width: 1024,
            height: 768,
          },
          'device-pixel-ratio': 2,
          vertical: {
            outline: {
              image: '@url(iPad-portrait.svg)',
              insets: {
                left: 52,
                top: 114,
                right: 55,
                bottom: 114,
              },
            },
            width: 768,
            height: 1024,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
        type: 'tablet',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '25',
      type: 'emulated-device',
      order: 41,
      device: {
        'show-by-default': false,
        title: 'iPad Pro',
        screen: {
          horizontal: {
            width: 1366,
            height: 1024,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 1024,
            height: 1366,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
        type: 'tablet',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '26',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Blackberry PlayBook',
        screen: {
          horizontal: {
            width: 1024,
            height: 600,
          },
          'device-pixel-ratio': 1,
          vertical: {
            width: 600,
            height: 1024,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.1.0; en-US) AppleWebKit/536.2+ (KHTML like Gecko) Version/7.2.1.0 Safari/536.2+',
        type: 'tablet',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '27',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Nexus 10',
        screen: {
          horizontal: {
            width: 1280,
            height: 800,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 800,
            height: 1280,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 10 Build/MOB31T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Safari/537.36',
        type: 'tablet',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '28',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Nexus 7',
        screen: {
          horizontal: {
            width: 960,
            height: 600,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 600,
            height: 960,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 7 Build/MOB30X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Safari/537.36',
        type: 'tablet',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '29',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Galaxy Note 3',
        screen: {
          horizontal: {
            width: 640,
            height: 360,
          },
          'device-pixel-ratio': 3,
          vertical: {
            width: 360,
            height: 640,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '30',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Galaxy Note II',
        screen: {
          horizontal: {
            width: 640,
            height: 360,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 360,
            height: 640,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; U; Android 4.1; en-us; GT-N7100 Build/JRO03C) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '31',
      type: 'emulated-device',
      device: {
        'show-by-default': true,
        title: 'Generic Laptop',
        screen: {
          horizontal: {
            width: 1280,
            height: 950,
          },
          'device-pixel-ratio': 1,
          vertical: {
            width: 950,
            height: 1280,
          },
        },
        capabilities: ['touch'],
        'user-agent': '',
        type: 'notebook',
        modes: [
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '32',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Laptop with HiDPI screen',
        screen: {
          horizontal: {
            width: 1440,
            height: 900,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 900,
            height: 1440,
          },
        },
        capabilities: [],
        'user-agent': '',
        type: 'notebook',
        modes: [
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '33',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Laptop with MDPI screen',
        screen: {
          horizontal: {
            width: 1280,
            height: 800,
          },
          'device-pixel-ratio': 1,
          vertical: {
            width: 800,
            height: 1280,
          },
        },
        capabilities: [],
        'user-agent': '',
        type: 'notebook',
        modes: [
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '36',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'MacBook Air',
        screen: {
          horizontal: {
            width: 1440,
            height: 900,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 900,
            height: 1440,
          },
        },
        capabilities: [],
        'user-agent': '',
        type: 'notebook',
        modes: [
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '37',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'MacBook Pro 13"',
        screen: {
          horizontal: {
            width: 2560,
            height: 1600,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 1600,
            height: 2580,
          },
        },
        capabilities: [],
        'user-agent': '',
        type: 'notebook',
        modes: [
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '38',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'MacBook Pro 15"',
        screen: {
          horizontal: {
            width: 2880,
            height: 1800,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 1800,
            height: 2880,
          },
        },
        capabilities: [],
        'user-agent': '',
        type: 'notebook',
        modes: [
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '39',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'MacBook Pro 16"',
        screen: {
          horizontal: {
            width: 3072,
            height: 1920,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 1920,
            height: 3072,
          },
        },
        capabilities: [],
        'user-agent': '',
        type: 'notebook',
        modes: [
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '40',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: '4K Display',
        screen: {
          horizontal: {
            width: 3840,
            height: 2160,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 2160,
            height: 3840,
          },
        },
        capabilities: [],
        'user-agent': '',
        type: 'notebook',
        modes: [
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '41',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: '5K Display',
        screen: {
          horizontal: {
            width: 5120,
            height: 2880,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 2880,
            height: 5120,
          },
        },
        capabilities: [],
        'user-agent': '',
        type: 'notebook',
        modes: [
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '34',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Responsive Mode',
        screen: {
          horizontal: {
            width: 500,
            height: 790,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 500,
            height: 790,
          },
        },
        capabilities: ['responsive', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '42',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'Moto G4',
        screen: {
          horizontal: {
            outline: {
              image: '@url(optimized/MotoG4-landscape.avif)',
              insets: {
                left: 91,
                top: 30,
                right: 74,
                bottom: 30,
              },
            },
            width: 640,
            height: 360,
          },
          'device-pixel-ratio': 3,
          vertical: {
            outline: {
              image: '@url(optimized/MotoG4-portrait.avif)',
              insets: {
                left: 30,
                top: 91,
                right: 30,
                bottom: 74,
              },
            },
            width: 360,
            height: 640,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36',
        'user-agent-metadata': {
          platform: 'Android',
          platformVersion: '6.0.1',
          architecture: '',
          model: 'Moto G (4)',
          mobile: true,
        },
        type: 'phone',
      },
    },
    {
      id: '43',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        'dual-screen': true,
        title: 'Surface Duo',
        screen: {
          horizontal: {
            width: 720,
            height: 540,
          },
          'device-pixel-ratio': 2.5,
          vertical: {
            width: 540,
            height: 720,
          },
          'vertical-spanned': {
            width: 1114,
            height: 720,
            hinge: {
              width: 34,
              height: 720,
              x: 540,
              y: 0,
              contentColor: {
                r: 38,
                g: 38,
                b: 38,
                a: 1,
              },
            },
          },
          'horizontal-spanned': {
            width: 720,
            height: 1114,
            hinge: {
              width: 720,
              height: 34,
              x: 0,
              y: 540,
              contentColor: {
                r: 38,
                g: 38,
                b: 38,
                a: 1,
              },
            },
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'spanned',
            orientation: 'vertical-spanned',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'spanned',
            orientation: 'horizontal-spanned',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '44',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        'dual-screen': true,
        title: 'Galaxy Fold',
        screen: {
          horizontal: {
            width: 653,
            height: 280,
          },
          'device-pixel-ratio': 3,
          vertical: {
            width: 280,
            height: 653,
          },
          'vertical-spanned': {
            width: 717,
            height: 512,
          },
          'horizontal-spanned': {
            width: 512,
            height: 717,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'spanned',
            orientation: 'vertical-spanned',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'spanned',
            orientation: 'horizontal-spanned',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '45',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'FUJITSU Display E24-9 TOUCH',
        screen: {
          horizontal: {
            width: 1920,
            height: 1080,
          },
          'device-pixel-ratio': 1,
          vertical: {
            width: 1080,
            height: 1920,
          },
        },
        capabilities: ['touch', 'responsive'],
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Safari/537.36',
        type: 'notebook',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '46',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'iPhone 12/13 Pro Max',
        screen: {
          horizontal: {
            width: 926,
            height: 428,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 428,
            height: 926,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_2 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D257 Safari/9537.53',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '47',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'iPhone 12/13 Pro',
        screen: {
          horizontal: {
            width: 844,
            height: 390,
          },
          'device-pixel-ratio': 2,
          vertical: {
            width: 390,
            height: 844,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_2 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D257 Safari/9537.53',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '48',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'iPhone 14 Pro',
        screen: {
          horizontal: {
            width: 852,
            height: 393,
          },
          'device-pixel-ratio': 3,
          vertical: {
            width: 393,
            height: 852,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
    {
      id: '49',
      type: 'emulated-device',
      device: {
        'show-by-default': false,
        title: 'iPhone 14 Pro Max',
        screen: {
          horizontal: {
            width: 932,
            height: 430,
          },
          'device-pixel-ratio': 3,
          vertical: {
            width: 430,
            height: 932,
          },
        },
        capabilities: ['touch', 'mobile'],
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        type: 'phone',
        modes: [
          {
            title: 'default',
            orientation: 'vertical',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
          {
            title: 'default',
            orientation: 'horizontal',
            insets: {left: 0, top: 0, right: 0, bottom: 0},
          },
        ],
      },
    },
  ],
  dependencies: ['emulation'],
  scripts: [],
  resources: [],
};
