import * as HTTPS from 'https'
import {prTitleIssueRegex} from "./parser";
import {GraphQLResponse, IAPIIssue, IAPIPR, IParsedCommit} from "./interfaces";

const Config = require('./config.json');

export function fetchPR(commit: IParsedCommit): Promise<IAPIPR | null> {
    return new Promise((resolve, reject) => {
        const options: HTTPS.RequestOptions = {
            protocol: 'https:',
            host: 'api.github.com',
            path: '/graphql',
            method: 'POST',
            headers: {
                'Authorization': `bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
                'User-Agent': 'what-the-changelog',
            },
        };

        const request = HTTPS.request(options, response => {
            let received = '';

            response.on('data', chunk => {
                received += chunk
            });

            response.on('end', () => {
                // try {
                const json: GraphQLResponse = JSON.parse(received);
                if (json.errors && json.errors.length) {
                    throw new Error(json.errors.map(e => e.message).join('\n'));
                }

                const pr = json.data.repository.pullRequest;

                const parts = pr.title.split(' ');
                if (parts.length && parts[0].match(prTitleIssueRegex)) {
                    pr.issueID = parts[0].split('-').slice(-1)[0];
                    pr.description = parts.slice(1).join(' ');
                } else {
                    throw Error(`Could\'t find issue ID in PR title: ${pr.title}`)
                }

                resolve(pr)
                // } catch (e) {
                //     resolve(null)
                // }
            });

            response.on('error', (e) => {
                throw(e)
            });
        });

        const graphql = `
{
  repository(owner: "${Config.officialOwner}", name: "${Config.reposirotyName}") {
    pullRequest(number: ${commit.prID}) {
      title
      body
    }
  }
}
`;
        request.write(JSON.stringify({query: graphql}));
        request.end()
    })
}

export function fetchIssue(id: string): Promise<IAPIIssue | null> {
    return new Promise((resolve, reject) => {
        const options: HTTPS.RequestOptions = {
            host: 'api.github.com',
            protocol: 'https:',
            path: '/graphql',
            method: 'POST',
            headers: {
                Authorization: `bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
                'User-Agent': 'what-the-changelog',
            },
        };

        const request = HTTPS.request(options, response => {
            let received = '';
            response.on('data', chunk => {
                received += chunk
            });

            response.on('end', () => {
                try {
                    const json = JSON.parse(received);
                    const issue = json.data.repository.issue;
                    resolve(issue)
                } catch (e) {
                    resolve(null)
                }
            })
        });

        const graphql = `
{
  repository(owner: "${Config.officialOwner}", name: "${Config.reposirotyName}") {
    issue(number: ${id}) {
      labels(first: 100){
        nodes{
          name
        }
      }
    }
  }
}
`;
        request.write(JSON.stringify({query: graphql}));
        request.end()
    })
}
