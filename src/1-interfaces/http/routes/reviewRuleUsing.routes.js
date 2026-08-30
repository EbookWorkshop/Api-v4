import { ReviewRuleUsingController } from "../controllers/ReviewRuleUsingController.js"
import Router from '@koa/router';

/**
 * @param {ReviewRuleUsingController} reviewRuleUsingController 
 * @returns 
 */
export function createReviewRuleUsingRoutes(reviewRuleUsingController) {
    const router = new Router({ prefix: '/review/bookwithrule' });
    router.get('/list', (ctx) => reviewRuleUsingController.listAll(ctx));
    router.get('/book', (ctx) => reviewRuleUsingController.getByBookId(ctx));

    router.post('/', (ctx) => reviewRuleUsingController.addBookRule(ctx));
    router.delete('/', (ctx) => reviewRuleUsingController.deleteBookRule(ctx));

    return router;
}