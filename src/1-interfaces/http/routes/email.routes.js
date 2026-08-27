import Router from '@koa/router';

/**
 * @param {EmailController} emailController 
 * @returns 
 */
export function createEmailRoutes(emailController) {
    const router = new Router({ prefix: '/services/email' });
    router.get('/inbox', (ctx) => emailController.getInboxEmail(ctx));
    router.get('/account', (ctx) => emailController.getEmailAccount(ctx));

    // 发送邮件
    // router.post('/send', (ctx) => emailController.postSendEmail(ctx));

    // 保存配置
    router.post('/account', (ctx) => emailController.postSaveAccount(ctx));
    router.post('/inbox', (ctx) => emailController.postSaveInbox(ctx));
    return router;
}
