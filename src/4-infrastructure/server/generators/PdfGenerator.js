import { IGenerator } from '../../../2-application/ports/IGenerator.js';
import fs from 'node:fs/promises';
import path from 'node:path';

export class PdfGenerator extends IGenerator {
    constructor(temp) {
        super(temp);
    }

}