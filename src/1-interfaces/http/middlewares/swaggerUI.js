import { koaSwagger } from 'koa2-swagger-ui';

export function createSwaggerUI(config = {}) {
    return koaSwagger({
        routePrefix: '/swagger',//拦截的路由
        swaggerOptions: {
            url: '/swagger.json',
        }
    })

}