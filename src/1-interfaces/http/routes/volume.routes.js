import { VolumeController } from "../controllers/VolumeController.js"
  import Router from '@koa/router';
  
  /**
   * @param {VolumeController} volumeController 
   * @returns 
   */
  export function createvolumeRoutes(volumeController) {
      const router = new Router({ prefix: '/library/book/volume' });
      router.get('/all', (ctx) => volumeController.listVolumes(ctx));
  

      router.put('/', (ctx) => volumeController.updateVolume(ctx));

      router.post('/', (ctx) => volumeController.createVolume(ctx));
    //   router.post('/reorder', (ctx) => volumeController.(ctx));

      router.delete('/', (ctx) => volumeController.deleteVolume(ctx));

      return router;
  }