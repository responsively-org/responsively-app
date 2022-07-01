name: Publish

on:
  push:
    branches:
      - main

jobs:
  publish:
    # To enable auto publishing to github, update your electron publisher
    # config in package.json > "build" and remove the conditional below
    if: ${{ github.repository_owner == 'electron-react-boilerplate' }}

    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [macos-latest]

    steps:
      - name: Checkout git repo
        uses: actions/checkout@v1

      - name: Install Node and NPM
        uses: actions/setup-node@v1
        with:
          node-version: 16
          cache: npm

      - name: Install dependencies
        run: |
          npm install

      - name: Publish releases
        env:
          # These values are used for auto updates signing
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASS: ${{ secrets.APPLE_ID_PASS }}
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
          # This is used for uploading release assets to github
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run postinstall
          npm run build
          npm exec electron-builder -- --publish always --win --mac --linux
