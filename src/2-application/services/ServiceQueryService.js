import { AppError, UserInputError } from "../../5-shared/errors/index.js"

export class ServiceQueryService {
    #config;
    #serviceServer;

    constructor(config, serviceServer) {
        this.#config = config;
        this.#serviceServer = serviceServer;
    }

    async getVersionInfo() {
        this.#serviceServer.updateVersionInfo();
        return this.#serviceServer.version();
    }
}
