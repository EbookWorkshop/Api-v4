import Router from '@koa/router';

export function createReviewBookRoutes(controller) {
    const router = new Router({ prefix: '/review/book' });

    router.post('/try', (ctx) => controller.tryReview(ctx));
    router.post('/save', (ctx) => controller.saveReview(ctx));
    router.get('/suspiciouschars', (ctx) => controller.analyzeSuspiciousChars(ctx));

    return router;
}