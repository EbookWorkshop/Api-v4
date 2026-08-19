import { VolumeController } from "../controllers/VolumeController.js"
  import Router from '@koa/router';
  
  /**
   * @param {VolumeController} volumeController 
   * @returns 
   */
  export function createvolumeRoutes(volumeController) {
      const router = new Router({ prefix: '/library/book/volume' });
      router.get('/all', (ctx) => volumeController.getAllVolumes(ctx));
  

      router.post('/', (ctx) => volumeController.createVolume(ctx));


      return router;
  }