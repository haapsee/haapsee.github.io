import { Octokit } from "@octokit/rest";
import * as fs from "fs";

const username = 'haapsee';

const octokit = new Octokit({
    auth: process.env.GITHUBTOKEN,
});

/**
 * Fetches user data from GitHub for a given username.
 *
 * @param {string} username - The GitHub username to fetch data for.
 * @returns {Promise<Object>} A promise that resolves to the user data object.
 */
async function getUserData(username) {
    return await octokit.request('GET /users/{username}', {
        username: username,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
}


/**
 * Fetches the social accounts of a GitHub user.
 *
 * @param {string} username - The GitHub username of the user whose social accounts are to be fetched.
 * @returns {Promise<Object>} A promise that resolves to the user's social accounts data.
 * @throws {Error} Throws an error if the request fails.
 */
async function getUserSocialAccounts(username) {
    return await octokit.request('GET /users/{username}/social_accounts', {
        username: username,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
}


/**
 * Fetches the organizations a user belongs to on GitHub.
 *
 * @param {string} username - The GitHub username of the user.
 * @returns {Promise<Object>} A promise that resolves to the response from the GitHub API containing the user's organizations.
 */
async function getUserOrganisations(username) {
    return await octokit.request('GET /users/{username}/orgs', {
        username: username,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
}

/**
 * Fetches the repositories of a specified GitHub user.
 *
 * @param {string} username - The GitHub username whose repositories are to be fetched.
 * @returns {Promise<Object>} A promise that resolves to the response object containing the user's repositories.
 */
async function getUserRepos(username) {
    return await octokit.request('GET /users/{username}/repos', {
        username: username,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
}

/**
 * Fetches the preferred languages for a list of repositories.
 *
 * @param {Array} repos - An array of repository objects.
 * @returns {Promise<Array>} A promise that resolves to an array of language data for each repository.
 */
async function getUserPreferredLanguages(repos) {
    let languages = {};

    for (let repo of repos) {
        let data = await octokit.request('GET /repos/{owner}/{repo}/languages', {
            owner: username,
            repo: repo.name,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        for (let lang in data.data) {
            if (languages[lang]) {
                languages[lang] += data.data[lang];
            } else {
                languages[lang] = data.data[lang];
            }
        }
        repo.languages = Object.keys(data.data);
    }

    // Calculate percentages
    let total = 0;
    for (let lang of Object.keys(languages)) {
        total += languages[lang];
    }

    for (let lang of Object.keys(languages)) {
        languages[lang] = (languages[lang] / total) * 100;
    }

    return languages;
}

/**
 * Filters a list of repositories based on specific criteria.
 *
 * @param {Array} repos - The array of repository objects to filter.
 * @returns {Promise<Array>} A promise that resolves to an array of filtered repository objects.
 *
 * The filtering criteria are:
 * - The repository is not a fork.
 * - The repository is not archived.
 * - The repository is not private.
 * - The repository is not disabled.
 * - The repository includes 'portfolio-project' in its topics.
 */
function filterPortfolioRepos(repos) {
    return repos
        .filter(repo => !repo.fork)
        .filter(repo => !repo.archived)
        .filter(repo => !repo.private)
        .filter(repo => !repo.disabled)
        .filter(repo => repo.topics.includes('portfolio-project'));
}

function writeToFile(data, filename) {
    fs.writeFile(filename, data, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`Data written to ${filename}`);
    });
}

// Get the user data
let data = await getUserData(username);
let user = data.data;

data = await getUserSocialAccounts(username);
let socialAccounts = data.data;

data = await getUserOrganisations(username);
let orgs = data;

data = await getUserRepos(username);
let repos = data.data;
let portfolioRepos = filterPortfolioRepos(repos);
let preferredLanguages = await getUserPreferredLanguages(repos);

console.log("User:\n", user, "\n\n");
console.log("Social Accounts:\n", socialAccounts, "\n\n");
console.log("Organisations:\n", orgs, "\n\n");
console.log("Repositories:\n", portfolioRepos, "\n\n");
console.log("Languages:\n", preferredLanguages, "\n\n");


writeToFile(JSON.stringify({ user, orgs, portfolioRepos, preferredLanguages, socialAccounts }), 'src/data.json');
