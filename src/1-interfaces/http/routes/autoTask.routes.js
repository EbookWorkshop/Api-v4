import { AutoTaskController } from "../controllers/AutoTaskController.js"
import Router from '@koa/router';

/**
 * @param {AutoTaskController} autoTaskController 
 * @returns 
 */
export function createAutoTaskRoutes(autoTaskController) {
    const router = new Router({ prefix: '/autotask' });
    router.get('/list', (ctx) => autoTaskController.listJobs(ctx));
    router.post('/', (ctx) => autoTaskController.saveJob(ctx));
    router.patch('/', (ctx) => autoTaskController.eidtJob(ctx));
    router.delete('/', (ctx) => autoTaskController.deleteJob(ctx));

    return router;
}