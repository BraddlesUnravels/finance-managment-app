import { Elysia } from 'elysia';
import { logger } from '@bogeychan/elysia-logger';

const app = new Elysia({ prefix: '/api/v1' })
    .onError(({ error, code, set }) => {
        console.log('Error occurred: ', JSON.stringify(error));
        switch (code) {
            case 'VALIDATION':
                set.status = 422;
                return { message: error.message };
            case 'NOT_FOUND':
                set.status = 404;
                return { message: 'Resource not found' };
            default:
                set.status = 500;
                return { message: 'An error occurred' };
        }
    })
    .use(logger({ level: 'debug' }))
    .get('/', () => 'Ok')
    .listen(3001);
console.log(`Elysia server is running in env ${app.server?.hostname}:${app.server?.port}`);

export default app;

export type Api = typeof app;
