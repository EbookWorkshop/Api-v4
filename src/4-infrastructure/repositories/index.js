import { EbookRepository } from './EbookRepository.js';
import { TagRepository } from "./TagRepository.js"

export function createRepositories(sequelize) {
  return {
    ebookRepository: new EbookRepository(sequelize),
    tagRepository: new TagRepository(sequelize),
    // 新增：userRepository: new UserRepository(sequelize),
  };
}