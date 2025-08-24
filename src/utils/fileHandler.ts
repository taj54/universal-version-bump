import fs from 'fs';

export class FileHandler {
  static fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  static readFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf8');
  }

  static writeFile(filePath: string, content: string): void {
    fs.writeFileSync(filePath, content);
  }
}
