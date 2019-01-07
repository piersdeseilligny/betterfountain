#!/usr/bin/env node

/**
 * This script will generate changelog.txt file with list of all the commits since the last tag
 *
 * The list can be used to update release page on GitHub
 */

var fs = require("fs");
var execSync = require("child_process").execSync;

function getRepoUrl() {
    var repoUrl = process.argv[2];
    repoUrl += repoUrl.endsWith("/") ? "" : "/";
    return repoUrl;
}

function getCurrentTag() {
    try {
        return execSync("git describe --abbrev=0", {encoding: "utf-8"}).trim();
    }
    catch (e) {
        return null;
    }
}

function getFirstCommit() {
    return execSync("git rev-list --max-parents=0 HEAD", {encoding: "utf-8"}).trim();
}

function getChanges(from, repoUrl) {
    var prettyFormat = "\"* [[`%h`](" + repoUrl + "commit/%h)] - %s\"";
    var listChangesCommand =  "git log " + from + "..HEAD --pretty=format:" + prettyFormat;
    return execSync(listChangesCommand, {encoding: "utf-8"});
}

function save(fileContent) {
    fs.writeFile("changelog.txt", fileContent, {encoding: "utf-8"});
}

function print(content) {
    console.log(content); // eslint-disable-line
}

function main() {
    if (!process.argv[2]) {
        process.stdout.write("Provide repo url as the first argument.\n");
        return;
    }
    
    var from = getCurrentTag() || getFirstCommit();
    var repoUrl = getRepoUrl();
    var changes = getChanges(from, repoUrl);
    var log = "Changes:\n\n" + changes;
    
    if (process.argv[3] === "console") {
        print(log);
    }
    else {
        save(log);
    }
}

main();