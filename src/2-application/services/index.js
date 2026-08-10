import { BookQueryService } from './BookQueryService.js';
import { BookCommandService } from './BookCommandService.js';
import { TagQueryService } from './TagQueryService.js';

export function createServices(repositories) {
  const { ebookRepository, tagRepository } = repositories;

  return {
    bookQuery: new BookQueryService(ebookRepository),
    bookCommand: new BookCommandService(ebookRepository),
    tagQuery: new TagQueryService(tagRepository),
  };
}
