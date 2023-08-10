# Responsively-App Contributing Guide

We are really excited that you are interested in contributing to Responsively-App :tada:. Before submitting your contribution, please make sure to take a moment and read 
the following instructions.

## Philosophy

🔑 Our philosophy is to keep things clean, simple and minimal. 

## Pull Request Guidelines

**In *all* Pull Requests:** provide a detailed description of the problem, as well as a demonstration with screen recordings and/or screenshots.

Please make sure the following is done before submitting a PR:

- Reference the related issue in the PR comment.
- Utilize [JSDoc](https://github.com/jsdoc/jsdoc) for better code documentation.
- Ensure all tests pass.

If you add new feature:

- Open a suggestion issue first.
- Provide your reasoning on why you want to add this feature.
- Submit your PR.

If you fix a bug:

- If you are resolving a special issue, please add `fix: #<issue number> <short message>` in your PR title (e.g.`fix: #1028 example`).
- Provide a detailed description of the bug in your PR and/or link to the issue. 

### Where should I start?

A good way to start is to find an [issue](https://github.com/responsively-org/responsively-app/issues) labeled as `bug`, `help wanted` or `feature request`. The `good first issue` issues are good for newcomers. Please discuss the solution for larger issues first and after the final solution is approved by the MarkText members, you can submit/work on the PR. For small changes you can directly open a PR.

Other ways to help:

- Documentation
- Translation (currently unavailable)
- Design icons and logos
- Improve the UI
- Write tests for responsively-app
- Share your thoughts! We want to hear about features you think are missing, any bugs you find, and why you :heart: Responsively-app.

## Quick start

1. Fork the repository.
2. Clone your fork: `git clone git@github.com:<username>/responsively-org/responsively-app.git`
3. Create a new branch
4. Make your changes and push your branch.
5. Create a PR against `main` and describe your changes.

**Rebase your PR:**

If there are conflicts or you want to update your local branch, please do the following:

1. `git fetch upstream`
2. `git rebase upstream/main`
3. Please [resolve](https://help.github.com/articles/resolving-merge-conflicts-after-a-git-rebase/) all conflicts and force push your branch: `git push -f`
