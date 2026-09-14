import Router from '@koa/router';


export function createBotRuleRoutes(webBookSourceURLController) {
    const router = new Router({ prefix: '/services/botrule' });
    router.post('/changehostname', (ctx) => webBookSourceURLController.changeHostname(ctx));

    return router;
}