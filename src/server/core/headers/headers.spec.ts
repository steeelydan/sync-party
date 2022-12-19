import express, { Request, Response } from 'express';
import supertest from 'supertest';
import { setupHeaders } from './headers.js';

beforeAll(() => {
    process.env.NODE_ENV = 'test';
});

describe('Setup Headers', () => {
    it('Has less secure headers before setup', async () => {
        const app = express();

        app.get('/', (req: Request, res: Response) => {
            return res.send('Hello headers');
        });

        const response = await supertest(app).get('/');

        const responseHeaders = response.headers;
        expect(Object.keys(responseHeaders)).toEqual([
            'x-powered-by',
            'content-type',
            'content-length',
            'etag',
            'date',
            'connection'
        ]);
        expect(responseHeaders['x-powered-by']).toBe('Express');
        expect(responseHeaders['content-type']).toBe(
            'text/html; charset=utf-8'
        );
        expect(responseHeaders['content-length']).toBe('13');
        expect(responseHeaders['connection']).toBe('close');
    });

    it('Has more secure headers after setup', async () => {
        const app = express();
        setupHeaders(app);

        app.get('/', (req: Request, res: Response) => {
            return res.send('Hello headers');
        });

        const response = await supertest(app).get('/');

        const responseHeaders = response.headers;

        expect(Object.keys(responseHeaders)).toEqual([
            'content-security-policy',
            'cross-origin-embedder-policy',
            'cross-origin-opener-policy',
            'cross-origin-resource-policy',
            'x-dns-prefetch-control',
            'expect-ct',
            'x-frame-options',
            'strict-transport-security',
            'x-download-options',
            'x-content-type-options',
            'origin-agent-cluster',
            'x-permitted-cross-domain-policies',
            'referrer-policy',
            'x-xss-protection',
            'content-type',
            'content-length',
            'etag',
            'date',
            'connection'
        ]);

        expect(responseHeaders['content-security-policy']).toBe(
            "default-src 'self';base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests"
        );
        expect(responseHeaders['x-dns-prefetch-control']).toBe('off');
        expect(responseHeaders['expect-ct']).toBe('max-age=0');
        expect(responseHeaders['x-frame-options']).toBe('SAMEORIGIN');
        expect(responseHeaders['strict-transport-security']).toBe(
            'max-age=15552000; includeSubDomains'
        );
        expect(responseHeaders['x-download-options']).toBe('noopen');
        expect(responseHeaders['x-content-type-options']).toBe('nosniff');
        expect(responseHeaders['x-permitted-cross-domain-policies']).toBe(
            'none'
        );
        expect(responseHeaders['referrer-policy']).toBe('no-referrer');
        expect(responseHeaders['x-xss-protection']).toBe('0');
        expect(responseHeaders['content-type']).toBe(
            'text/html; charset=utf-8'
        );
        expect(responseHeaders['content-length']).toBe('13');
        expect(responseHeaders['connection']).toBe('close');
    });

    it('configures headers based on options if provided', async () => {
        const app = express();
        setupHeaders(app, {
            contentSecurityPolicy: {
                directives: {
                    'default-src': 'self',
                    'base-uri': 'self',
                    'script-src':
                        "'self' 'unsafe-inline' www.youtube.com s.ytimg.com"
                }
            }
        });

        app.get('/', (req: Request, res: Response) => {
            return res.send('Hello headers');
        });

        const response = await supertest(app).get('/');

        const responseHeaders = response.headers;

        expect(Object.keys(responseHeaders)).toEqual([
            'content-security-policy',
            'cross-origin-embedder-policy',
            'cross-origin-opener-policy',
            'cross-origin-resource-policy',
            'x-dns-prefetch-control',
            'expect-ct',
            'x-frame-options',
            'strict-transport-security',
            'x-download-options',
            'x-content-type-options',
            'origin-agent-cluster',
            'x-permitted-cross-domain-policies',
            'referrer-policy',
            'x-xss-protection',
            'content-type',
            'content-length',
            'etag',
            'date',
            'connection'
        ]);

        expect(responseHeaders['content-security-policy']).toBe(
            "default-src self;base-uri self;script-src 'self' 'unsafe-inline' www.youtube.com s.ytimg.com;block-all-mixed-content;font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests"
        );
    });
});
