# what-the-changelog

Extracted and modified from https://github.com/desktop/desktop/ changelog generation script.

Automatically generates changelog for a release while enforcing a few god pull request and issue naming practices.

## Usage

1. Create a GitHub personal access token with read access to your repo and add it in `GITHUB_ACCESS_TOKEN` environment variable.
1. Run the script -

        npm run <last-tag>

## Arguments

        npm run <officialOwner> <repositoryName> <projectDir> <order: comma separated resolution labels> <resolutionIconRoot>

* **officialOwner**: organization or user name under which the repo exists.
* **reposirotyName**: name pf respository, as occuring in GitHub URL.
* **projectDir**: path of project directory to generate changelog for.
* **order**: order in which resolutions should occur in the changelog.
* **resolutionIconRoot**: root URL where resolution icons exist. Icon names should be same as resolution names.
