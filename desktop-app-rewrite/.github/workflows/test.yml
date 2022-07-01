name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v1

      - name: Install Node.js and NPM
        uses: actions/setup-node@v2
        with:
          node-version: 16
          cache: npm

      - name: npm install
        run: |
          npm install

      - name: npm test
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run package
          npm run lint
          npm exec tsc
          npm test
