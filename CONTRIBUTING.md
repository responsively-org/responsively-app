
## Contributing

Contributions are welcome and always appreciated!

To begin working on an issue, simply leave a comment indicating that you're taking it on. There's no need to be officially assigned to the issue before you start.

### Before Starting
Do keep in mind before you start working on an issue / posting a PR:
- Search existing PRs related to that issue which might close them
- Confirm if other contributors are working on the same issue

### Tips & Things to Consider
- We are active in Discord and can help out if you get stuck, [join us!](https://responsively.app/join-discord)
- PRs with tests are highly appreciated
- Avoid adding third party libraries, whenever possible
- Unless you are helping out by updating dependencies, you should not be uploading your yarn.lock or updating any dependencies in your PR
- If you are unsure where to start, contact us and we will point you to a first good issue

## Run Locally
Ensure you have the following dependencies installed:
- Install `node` and `yarn`
- Configure your IDE to support ESLint and Prettier extensions.

After having above installed, proceed through the following steps to setup the codebase locally.

- Fork the project & [clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) it locally.

![fork-project](https://github.com/responsively-org/responsively-app/assets/87022870/2cae8b2a-850c-4f80-8ede-32eba622a854)

- Create a new separate branch.

```bash
git checkout -b BRANCH_NAME
```
- Go to the desktop-app directory.

```bash
cd desktop-app
```

- Run the following command to install dependencies inside the desktop-app directory.

```bash
yarn
```

- This will start the app for local development with live reloading.

```bash
yarn dev
```

## Running Tests

It is crucial to test your code before submitting a pull request. Please ensure that you can make a complete production build before you submit your code for merging.

- Build the project
```bash
yarn build
```

- Now test your code using the following command
```bash
yarn test
```

Make sure the tests have successfully passed. 

## Pull Request

🎉 Now that you're ready to submit your code for merging, there are some points to keep in mind.

- Fill your PR description template accordingly.
    - Have an appropriate title and description.
    - Include relevant screenshots/gifs.

- If your PR fixes some issue, be sure to add this line with the issue **in the body** of the Pull Request description.
```text
Fixes #00000
```

- If your PR is referencing an issue
```text
Refs #00000
```

- Ensure that "Allow edits from maintainers" option is checked.

## Community
Need help on a solution from fellow contributors or want to discuss about a feature/issue? 

Join our [Discord](https://responsively.app/join-discord)!