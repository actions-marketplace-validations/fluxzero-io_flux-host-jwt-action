import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import test from 'node:test';
import {URL} from 'node:url';

test('OIDC mode exchanges GitHub OIDC through the provider-neutral Integration endpoint', async () => {
    const oidcToken = 'github.header.payload.signature';
    const deployToken = 'fluxzero.deploy.session';
    let exchangeRequest;
    const server = http.createServer(async (request, response) => {
        if (request.url?.startsWith('/oidc')) {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({value: oidcToken}));
            return;
        }
        exchangeRequest = {
            method: request.method,
            url: request.url,
            body: await readBody(request),
        };
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({
            token: oidcToken,
            userId: 'github-integration',
            deployToken,
            registryHost: 'registry.example.test',
        }));
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');

    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'fluxzero-jwt-action-'));
    const outputFile = path.join(temporaryDirectory, 'github-output');
    await writeFile(outputFile, '');

    try {
        const address = server.address();
        assert(address && typeof address !== 'string');
        const host = `http://127.0.0.1:${address.port}`;
        const result = await runAction({
            INPUT_MODE: 'oidc',
            INPUT_AUDIENCE: 'https://cloud.fluxzero.io',
            'INPUT_FLUXZERO-HOST': host,
            'INPUT_IMAGE-NAME': 'ignored-compatibility-input',
            ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'request-token',
            ACTIONS_ID_TOKEN_REQUEST_URL: `${host}/oidc?api-version=2.0`,
            GITHUB_OUTPUT: outputFile,
        });

        assert.equal(result.code, 0, result.stderr);
        assert.deepEqual(exchangeRequest, {
            method: 'POST',
            url: '/api/integrations/exchange-token',
            body: JSON.stringify({externalToken: oidcToken}),
        });
        assert.equal(new URL(`${host}/oidc?api-version=2.0`).pathname, '/oidc');

        const outputs = await readFile(outputFile, 'utf8');
        assertOutput(outputs, 'token', oidcToken);
        assertOutput(outputs, 'userId', 'github-integration');
        assertOutput(outputs, 'deploy-token', deployToken);
        assertOutput(outputs, 'registry-host', 'registry.example.test');
    } finally {
        server.close();
        await once(server, 'close');
        await rm(temporaryDirectory, {recursive: true, force: true});
    }
});

function readBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        request.setEncoding('utf8');
        request.on('data', chunk => body += chunk);
        request.on('end', () => resolve(body));
        request.on('error', reject);
    });
}

function runAction(environment) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ['dist/index.js'], {
            cwd: path.resolve(import.meta.dirname, '..'),
            env: {...process.env, ...environment},
        });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', chunk => stdout += chunk);
        child.stderr.on('data', chunk => stderr += chunk);
        child.on('error', reject);
        child.on('close', code => resolve({code, stdout, stderr}));
    });
}

function assertOutput(outputs, name, value) {
    assert.match(outputs, new RegExp(`${escapeRegex(name)}<<ghadelimiter_[^\\n]+\\n${escapeRegex(value)}\\n`));
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
