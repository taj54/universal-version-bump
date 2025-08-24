import fs from 'fs';

export class FileHandler {
  constructor() {}

  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  readFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf8');
  }

  writeFile(filePath: string, content: string): void {
    fs.writeFileSync(filePath, content);
  }
}
