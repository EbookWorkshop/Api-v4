import { ReviewRuleController } from "../controllers/ReviewRuleController.js"
  import Router from '@koa/router';
  
  /**
   * @param {ReviewRuleController} reviewRuleController 
   * @returns 
   */
  export function createreviewRuleRoutes(reviewRuleController) {
      const router = new Router({ prefix: '/review/rule' });
      router.get('/list', (ctx) => reviewRuleController.listReviewRule(ctx));
      
      router.post('/', (ctx) => reviewRuleController.createOrUpdateReviewRule(ctx));
      return router;
  }