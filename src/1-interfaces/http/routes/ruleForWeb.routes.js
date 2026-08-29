import { RuleForWebController } from "../controllers/RuleForWebController.js"
import Router from '@koa/router';

/**
 * @param {RuleForWebController} ruleForWebController 
 * @returns 
 */
export function createRuleForWebRoutes(ruleForWebController) {
    const router = new Router({ prefix: '/services/botrule' });
    router.get('/hostlist', (ctx) => ruleForWebController.getBotRuleHostList(ctx));

    return router;
}