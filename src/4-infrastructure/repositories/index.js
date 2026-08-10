import { EbookRepository } from './EbookRepository.js';

export function createRepositories(sequelize) {
  return {
    ebookRepository: new EbookRepository(sequelize),
    // 新增：userRepository: new UserRepository(sequelize),
  };
}