import listFiles from "./listFiles";
import readFile from "./readFile";
import writeFile from "./writeFile";
import updateFile from "./updateFile";
import deleteFile from "./deleteFile";
import renameFile from "./renameFile";
import renameFolder from "./renameFolder";
import moveFile from "./moveFile";
import createFolder from "./createFolder";

const filesTools = {
  read_file: readFile,
  list_files: listFiles,
  write_file: writeFile,
  update_file: updateFile,
  delete_file: deleteFile,
  rename_file: renameFile,
  rename_folder: renameFolder,
  move_file: moveFile,
  create_folder: createFolder,
};

export default filesTools;
