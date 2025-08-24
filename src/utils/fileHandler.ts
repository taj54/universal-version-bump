import fs from 'fs';
import { FileNotFoundError } from '../errors';

export class FileHandler {
  constructor() {}

  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  readFile(filePath: string): string {
    if (!this.fileExists(filePath)) {
      throw new FileNotFoundError(`File not found: ${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf8');
  }

  writeFile(filePath: string, content: string): void {
    // For writeFile, we don't necessarily need to check fileExists first
    // as fs.writeFileSync will create the file if it doesn't exist.
    // However, if we want to ensure the directory exists, that's a different concern.
    fs.writeFileSync(filePath, content);
  }
}
