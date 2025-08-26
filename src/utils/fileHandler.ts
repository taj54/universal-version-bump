import fs from 'fs';
import { FileNotFoundError } from '../errors';

/**
 * Utility class for handling file operations.
 */
export class FileHandler {
  constructor() {}

  /**
   * Checks if a file exists.
   * @param filePath The path to the file.
   * @returns True if the file exists, false otherwise.
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Reads the contents of a file.
   * @param filePath The path to the file.
   * @returns The contents of the file.
   */
  readFile(filePath: string): string {
    if (!this.fileExists(filePath)) {
      throw new FileNotFoundError(`File not found: ${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf8');
  }

  /**
   * Writes the contents to a file.
   * @param filePath The path to the file.
   * @param content The content to write to the file.
   */
  writeFile(filePath: string, content: string): void {
    fs.writeFileSync(filePath, content);
  }
}
