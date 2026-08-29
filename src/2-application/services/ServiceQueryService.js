import { AppError, UserInputError } from "../../5-shared/errors/index.js"

export class ServiceQueryService {
    #config;
    #serviceServer;

    constructor(config, serviceServer) {
        this.#config = config;
        this.#serviceServer = serviceServer;
    }

    async getVersionInfo() {
        return this.#serviceServer.version();
    }
    
    async checkSiteAccessibility(host) {
        return this.#serviceServer.checkSiteAccessibility(host)

    }
}
