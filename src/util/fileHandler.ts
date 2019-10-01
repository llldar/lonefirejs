// import { promisify } from 'util';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { fileOptions } from './consts';
import getLogger from './logger';

const logger = getLogger(__filename.slice(__dirname.length + 1, -3));
const { readdir, stat } = fsPromises;

/**
 * listDir
 * @param path the path of directory
 * @param option oneof the fileOptions
 * @returns list of filenames in target directory
 */
const listDir = async (
  path: string,
  option = fileOptions.all
): Promise<string[]> => {
  try {
    const files = await readdir(path);
    const dirs = await Promise.all(
      files
        .filter(async file => {
          const result = await stat(join(path, file));
          switch (option) {
            case fileOptions.dirs:
              return result.isDirectory();
            case fileOptions.files:
              return !result.isDirectory();
            case fileOptions.all:
            default:
              return true;
          }
        })
        .map(file => JSON.stringify(file).replace(/"/gm, ''))
    );

    return dirs;
  } catch (err) {
    logger.error(err);
    return [];
  }
};

export default { listDir };
