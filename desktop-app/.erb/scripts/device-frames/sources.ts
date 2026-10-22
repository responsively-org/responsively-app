/**
 * Every real device frame bundled with the app, and where it comes from.
 *
 * Only sources with a licence that allows redistribution inside this
 * MIT-licensed app are listed (Apache-2.0, BSD-3-Clause, CC0, CC BY, CC BY-SA);
 * vendor design resources (Apple, Meta, Samsung, Microsoft press kits…) all
 * forbid it and were ruled out. Downloads are pinned to a commit or a file
 * hash so a regeneration reproduces the same artwork.
 */

export type SourceKey = 'aosp' | 'chrome-devtools' | 'wikimedia-commons';

export interface SourceInfo {
  name: string;
  url: string;
  license: string;
  licenseUrl: string;
  copyright: string;
}

export const SOURCES: Record<SourceKey, SourceInfo> = {
  aosp: {
    name: 'Android Studio device art (AOSP)',
    url: 'https://android.googlesource.com/platform/tools/adt/idea/+/refs/heads/mirror-goog-studio-main/artwork/resources/device-art-resources/',
    license: 'Apache-2.0',
    licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
    copyright: 'Copyright (C) The Android Open Source Project',
  },
  'chrome-devtools': {
    name: 'Chrome DevTools device outlines',
    url: 'https://github.com/ChromeDevTools/devtools-frontend/tree/19e88ae6de83cc6dbb31f4c5c08209151c9b7b99/front_end/emulated_devices',
    license: 'BSD-3-Clause',
    licenseUrl:
      'https://github.com/ChromeDevTools/devtools-frontend/blob/19e88ae6de83cc6dbb31f4c5c08209151c9b7b99/LICENSE',
    copyright: 'Copyright 2014 The Chromium Authors',
  },
  'wikimedia-commons': {
    name: 'Wikimedia Commons',
    url: 'https://commons.wikimedia.org/wiki/Category:SVG_mobile_phones',
    license: 'per file (CC0 / CC BY 4.0 / CC BY-SA 4.0)',
    licenseUrl: 'https://creativecommons.org/licenses/',
    copyright: 'per file — see NOTICE.md',
  },
};

/** platform/tools/adt/idea, mirror-goog-studio-main head on 2026-09-02. */
export const AOSP_COMMIT = 'd9039d0b361f78cc563ab8a40671ef38477d9f74';
/** Last devtools-frontend commit before the outline artwork was deleted (2026-08-10). */
export const DEVTOOLS_COMMIT = '19e88ae6de83cc6dbb31f4c5c08209151c9b7b99';

export interface FrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BaseSpec {
  /** Frame id (kebab-case; becomes the asset file name and the manifest key). */
  id: string;
  /** Device the artwork depicts. */
  name: string;
}

/** An Android Studio / emulator skin folder: geometry comes from its `layout` file. */
export interface AospSpec extends BaseSpec {
  source: 'aosp';
  /** Folder under device-art-resources, e.g. `pixel_9_pro` or `pixel_fold/default`. */
  skin: string;
}

/** A Chrome DevTools outline: the screen is the image minus the insets, in CSS px. */
export interface DevtoolsSpec extends BaseSpec {
  source: 'chrome-devtools';
  file: string;
  insets: {left: number; top: number; right: number; bottom: number};
  /** Screen size in CSS px (the image is stretched to insets + screen). */
  screen: {width: number; height: number};
  orientation: 'portrait' | 'landscape';
  /** 'rect' punches the (opaque) screen out; 'none' for artwork that is already transparent. */
  cutout: 'rect' | 'none';
}

/** A Wikimedia Commons SVG: the screen is the element whose box matches `screen`. */
export interface CommonsSpec extends BaseSpec {
  source: 'wikimedia-commons';
  /** File title on Commons (for the credit line). */
  title: string;
  url: string;
  /** SHA-1 of the file as reported by the Commons API; regeneration fails on a mismatch. */
  sha1: string;
  license: string;
  licenseUrl: string;
  author: string;
  /** Screen rectangle in the SVG's viewBox units. */
  screen: FrameRect;
  /** Screen corner radius in viewBox units. */
  screenRadius: number;
  orientation: 'portrait' | 'landscape';
  /**
   * 'overlay' punches out the exact shape of the element drawing the screen
   * and keeps whatever is painted over it (notch, camera island); 'rect'
   * punches the rounded rectangle out of the raster.
   */
  cutout: 'overlay' | 'rect';
}

export type FrameSpec = AospSpec | DevtoolsSpec | CommonsSpec;

const aosp = (id: string, name: string, skin: string): AospSpec => ({
  id,
  name,
  source: 'aosp',
  skin,
});

const CC_BY_SA_4 = {
  license: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
};
const GOLDEN_BOX = 'TheGoldenBox (Wikimedia Commons)';

const iphone = (
  id: string,
  name: string,
  title: string,
  url: string,
  sha1: string,
  screen: FrameRect,
  screenRadius: number
): CommonsSpec => ({
  id,
  name,
  source: 'wikimedia-commons',
  title,
  url,
  sha1,
  ...CC_BY_SA_4,
  author: GOLDEN_BOX,
  screen,
  screenRadius,
  orientation: 'portrait',
  cutout: 'overlay',
});

export const FRAMES: FrameSpec[] = [
  // ---- Google (AOSP device art) -------------------------------------------
  aosp('nexus-4', 'Nexus 4', 'nexus_4'),
  aosp('nexus-5', 'Nexus 5', 'nexus_5'),
  aosp('nexus-5x', 'Nexus 5X', 'nexus_5x'),
  aosp('nexus-6', 'Nexus 6', 'nexus_6'),
  aosp('nexus-6p', 'Nexus 6P', 'nexus_6p'),
  aosp('nexus-7', 'Nexus 7 (2013)', 'nexus_7_2013'),
  aosp('nexus-10', 'Nexus 10', 'nexus_10'),
  aosp('pixel-2', 'Pixel 2', 'pixel_2'),
  aosp('pixel-2-xl', 'Pixel 2 XL', 'pixel_2_xl'),
  aosp('pixel-3', 'Pixel 3', 'pixel_3'),
  aosp('pixel-3-xl', 'Pixel 3 XL', 'pixel_3_xl'),
  aosp('pixel-4', 'Pixel 4', 'pixel_4'),
  aosp('pixel-5', 'Pixel 5', 'pixel_5'),
  aosp('pixel-7', 'Pixel 7', 'pixel_7'),
  aosp('pixel-7a', 'Pixel 7a', 'pixel_7a'),
  aosp('pixel-7-pro', 'Pixel 7 Pro', 'pixel_7_pro'),
  aosp('pixel-8', 'Pixel 8', 'pixel_8'),
  aosp('pixel-8-pro', 'Pixel 8 Pro', 'pixel_8_pro'),
  aosp('pixel-8a', 'Pixel 8a', 'pixel_8a'),
  aosp('pixel-9', 'Pixel 9', 'pixel_9'),
  aosp('pixel-9-pro', 'Pixel 9 Pro', 'pixel_9_pro'),
  aosp('pixel-9a', 'Pixel 9a', 'pixel_9a'),
  aosp('pixel-10', 'Pixel 10', 'pixel_10'),
  aosp('pixel-10-pro', 'Pixel 10 Pro', 'pixel_10_pro'),
  aosp('pixel-tablet', 'Pixel Tablet', 'pixel_tablet'),

  // ---- Chrome DevTools outlines --------------------------------------------
  {
    id: 'iphone-5',
    name: 'iPhone 5/SE',
    source: 'chrome-devtools',
    file: 'iPhone5-portrait.svg',
    insets: {left: 29, top: 105, right: 25, bottom: 111},
    screen: {width: 320, height: 568},
    orientation: 'portrait',
    cutout: 'rect',
  },
  {
    id: 'iphone-6',
    name: 'iPhone 6/7/8',
    source: 'chrome-devtools',
    file: 'iPhone6-portrait.svg',
    insets: {left: 28, top: 105, right: 28, bottom: 105},
    screen: {width: 375, height: 667},
    orientation: 'portrait',
    cutout: 'rect',
  },
  {
    id: 'iphone-6-plus',
    name: 'iPhone 6/7/8 Plus',
    source: 'chrome-devtools',
    file: 'iPhone6Plus-portrait.svg',
    insets: {left: 26, top: 107, right: 30, bottom: 111},
    screen: {width: 414, height: 736},
    orientation: 'portrait',
    cutout: 'rect',
  },
  {
    id: 'ipad',
    name: 'iPad',
    source: 'chrome-devtools',
    file: 'iPad-portrait.svg',
    insets: {left: 52, top: 114, right: 55, bottom: 114},
    screen: {width: 768, height: 1024},
    orientation: 'portrait',
    cutout: 'rect',
  },
  {
    id: 'moto-g4',
    name: 'Moto G4',
    source: 'chrome-devtools',
    file: 'MotoG4-portrait.svg',
    insets: {left: 30, top: 91, right: 30, bottom: 74},
    screen: {width: 360, height: 640},
    orientation: 'portrait',
    cutout: 'rect',
  },
  {
    id: 'nest-hub',
    name: 'Nest Hub',
    source: 'chrome-devtools',
    file: 'google-nest-hub-horizontal.png',
    insets: {left: 82, top: 74, right: 83, bottom: 222},
    screen: {width: 1024, height: 600},
    orientation: 'landscape',
    cutout: 'none',
  },
  {
    id: 'nest-hub-max',
    name: 'Nest Hub Max',
    source: 'chrome-devtools',
    file: 'google-nest-hub-max-horizontal.png',
    insets: {left: 92, top: 96, right: 91, bottom: 248},
    screen: {width: 1280, height: 800},
    orientation: 'landscape',
    cutout: 'none',
  },

  // ---- Wikimedia Commons ----------------------------------------------------
  {
    id: 'iphone-4',
    name: 'iPhone 4',
    source: 'wikimedia-commons',
    title: 'BenBois-iPhone-SVG.svg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/BenBois-iPhone-SVG.svg',
    sha1: 'cdf25fe757f7c517be6bd5cc7b4885ae09948df6',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    author: 'BenBois (openclipart.org)',
    screen: {x: 35, y: 128.2, width: 320, height: 480},
    screenRadius: 0,
    orientation: 'portrait',
    cutout: 'overlay',
  },
  iphone(
    'iphone-se-2',
    'iPhone SE (2020)',
    'IPhone SE (2nd generation) white vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/9/9d/IPhone_SE_%282nd_generation%29_white_vector.svg',
    '814879ce24924c6e3ff9b4fefd7b56a2e526da58',
    {x: 30.3, y: 110.4, width: 387.8, height: 686.3},
    0
  ),
  iphone(
    'iphone-x',
    'iPhone X',
    'IPhone X vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/3/32/IPhone_X_vector.svg',
    '90ec72b6a0967bc083768442e70045c9691e4a8c',
    {x: 6.3, y: 5.9, width: 82.7, height: 179.2},
    8.6
  ),
  iphone(
    'iphone-xr',
    'iPhone XR',
    'IPhone XR Blue.svg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e9/IPhone_XR_Blue.svg',
    '7d4d4586b428ef580e785b15424728b88c2a17cf',
    {x: 6.3, y: 5.9, width: 82.7, height: 179.2},
    8.6
  ),
  iphone(
    'iphone-12-pro',
    'iPhone 12 Pro',
    'IPhone 12 Pro Gold.svg',
    'https://upload.wikimedia.org/wikipedia/commons/3/3e/IPhone_12_Pro_Gold.svg',
    '9a92b24d434e6f4aee0e6986980a193eeaf4468a',
    {x: 5.2, y: 4.5, width: 85, height: 184.1},
    10
  ),
  iphone(
    'iphone-13-pro',
    'iPhone 13 Pro',
    'IPhone 13 Pro vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/b/b5/IPhone_13_Pro_vector.svg',
    '4ea0f966eb3eacf9b1686f5adc3a5169b3f61c93',
    {x: 5.2, y: 4.5, width: 85, height: 184.1},
    10
  ),
  iphone(
    'iphone-14',
    'iPhone 14',
    'IPhone 14 vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/6/61/IPhone_14_vector.svg',
    '472fd35c262bdb920ef298e0e5f65ed38325f84d',
    {x: 5.5, y: 4.5, width: 85, height: 184.1},
    10
  ),
  iphone(
    'iphone-14-pro',
    'iPhone 14 Pro',
    'IPhone 14 Pro vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/9/9f/IPhone_14_Pro_vector.svg',
    '92a831c71adb6177acafee35a35bff8c339af3e1',
    {x: 5, y: 4.3, width: 85.2, height: 184.5},
    12
  ),
  iphone(
    'iphone-15',
    'iPhone 15',
    'IPhone 15 Vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/e/ee/IPhone_15_Vector.svg',
    '30220d977060ee857d811fdd6d7ca4294c85432b',
    {x: 5, y: 4.3, width: 85.2, height: 184.5},
    12
  ),
  iphone(
    'iphone-15-plus',
    'iPhone 15 Plus',
    'IPhone 15 Plus Vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/a/a3/IPhone_15_Plus_Vector.svg',
    '37f38eea77800d755e4f46c63b9758047a019fc6',
    {x: 4.9, y: 4.3, width: 93.4, height: 202.1},
    13
  ),
  iphone(
    'iphone-15-pro',
    'iPhone 15 Pro',
    'IPhone 15 Pro Vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f5/IPhone_15_Pro_Vector.svg',
    '2c27b9e03c33cbebb056af2c5ebf04bdcc67de3f',
    {x: 4.1, y: 3.8, width: 86, height: 185.5},
    12
  ),
  iphone(
    'iphone-15-pro-max',
    'iPhone 15 Pro Max',
    'IPhone 15 Pro Max Vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/2/26/IPhone_15_Pro_Max_Vector.svg',
    'efe602effedbc02819ff0cc9254b1de2adae651c',
    {x: 4.2, y: 3.8, width: 94.7, height: 204.6},
    13
  ),
  iphone(
    'iphone-16',
    'iPhone 16',
    'IPhone 16 Vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/IPhone_16_Vector.svg',
    '034284599f5c42f5cc63f3952b27c406d532bcd4',
    {x: 5, y: 4.3, width: 85.2, height: 184.5},
    12
  ),
  iphone(
    'iphone-16-plus',
    'iPhone 16 Plus',
    'IPhone 16 Plus Vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/7/75/IPhone_16_Plus_Vector.svg',
    'e38ac17da66dae780a9bbc581ecf33b53a139e8c',
    {x: 4.9, y: 4.3, width: 93.4, height: 202.1},
    13
  ),
  iphone(
    'iphone-16-pro',
    'iPhone 16 Pro',
    'IPhone 16 Pro Vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/d/d2/IPhone_16_Pro_Vector.svg',
    'b079159fb0450608f92766cfb7b800afda5be1f2',
    {x: 4.1, y: 3.1, width: 86, height: 186.9},
    12
  ),
  iphone(
    'iphone-16-pro-max',
    'iPhone 16 Pro Max',
    'IPhone 16 Pro Max Vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/f/fc/IPhone_16_Pro_Max_Vector.svg',
    '19e99f2c749213bf91c052f182effe7bfd19a275',
    {x: 4, y: 3.4, width: 95.2, height: 205.3},
    13
  ),
  iphone(
    'iphone-17',
    'iPhone 17',
    'IPhone 17 Vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e6/IPhone_17_Vector.svg',
    'b88a428dd98f102afa8062dd3992a03b1526e756',
    {x: 2.9, y: 2.5, width: 66.7, height: 145.1},
    9.3
  ),
  iphone(
    'iphone-17-pro',
    'iPhone 17 Pro',
    'IPhone 17 Pro Vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f5/IPhone_17_Pro_Vector.svg',
    'dc59b566c7bab0631f1bcfc076bb191eb531430f',
    {x: 2.9, y: 2.5, width: 66.7, height: 145.1},
    9.3
  ),
  iphone(
    'iphone-17-pro-max',
    'iPhone 17 Pro Max',
    'IPhone 17 Pro Max Vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/2/2f/IPhone_17_Pro_Max_Vector.svg',
    '263b4f8a10ec1ff738142882b39861af6442caca',
    {x: 2.9, y: 2.5, width: 73.3, height: 158.5},
    10
  ),
  iphone(
    'iphone-air',
    'iPhone Air',
    'IPhone Air Vector.svg',
    'https://upload.wikimedia.org/wikipedia/commons/2/20/IPhone_Air_Vector.svg',
    '0ef78da912459eda64af0856ba3936cd7b92010d',
    {x: 3.3, y: 2.8, width: 69, height: 150.5},
    9.7
  ),
  {
    id: 'nothing-phone-1',
    name: 'Nothing Phone (1)',
    source: 'wikimedia-commons',
    title: 'Nothing phone(1) White.svg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Nothing_phone%281%29_White.svg',
    sha1: '0b703e320d9c7ae83a9f149e461b83365e489d8d',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    author: 'Raju (Wikimedia Commons)',
    screen: {x: 35, y: 36, width: 662, height: 1444},
    screenRadius: 74,
    orientation: 'portrait',
    cutout: 'overlay',
  },
  {
    id: 'laptop',
    name: 'Laptop',
    source: 'wikimedia-commons',
    title: 'Asahilinux laptop mockup.svg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Asahilinux_laptop_mockup.svg',
    sha1: '6ea713fd05aecc2ce7fda6e3304a4d6ce67b7e7f',
    ...CC_BY_SA_4,
    author:
      'Asahi Linux project, based on "Apple MacBook Pro SVG" by averywebdesign (CC BY-SA 3.0)',
    screen: {x: 234.5, y: 75, width: 1521.5, height: 954.8},
    screenRadius: 0,
    orientation: 'landscape',
    // The screen carries a logo drawn over the screen rect: punch the whole
    // rectangle out of the raster.
    cutout: 'rect',
  },
];
