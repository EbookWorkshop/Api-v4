import { BookQueryService } from './BookQueryService.js';
import { BookCommandService } from './BookCommandService.js';

export function createServices(repositories) {
  const { ebookRepository } = repositories;

  return {
    bookQuery: new BookQueryService(ebookRepository),
    bookCommand: new BookCommandService(ebookRepository),
    // 新增：user: new UserService(repositories.userRepository),
  };
}
