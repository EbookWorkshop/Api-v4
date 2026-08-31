import { RuleForWebController } from "../controllers/RuleForWebController.js"
import Router from '@koa/router';

/**
 * @param {RuleForWebController} ruleForWebController 
 * @returns 
 */
export function createRuleForWebRoutes(ruleForWebController) {
    const router = new Router({ prefix: '/services/botrule' });
    router.get('/', (ctx) => ruleForWebController.getBotRules(ctx));
    router.get('/export', (ctx) => ruleForWebController.exportRules(ctx));
    router.get('/hostlist', (ctx) => ruleForWebController.listBotRuleHosts(ctx));
    router.get('/dictionaries', (ctx) => ruleForWebController.getDictionaryByURL(ctx));
    router.get('/registeredwebsites', (ctx) => ruleForWebController.listRegisteredWebsites(ctx));
    
    router.post('/', (ctx) => ruleForWebController.batchUpsertBotRules(ctx));
    router.post('/import', (ctx) => ruleForWebController.importBotRules(ctx));

    router.delete('/', (ctx) => ruleForWebController.deleteBotRules(ctx));
    return router;
}