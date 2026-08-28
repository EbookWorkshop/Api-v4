export const toMB = (bytes) => (bytes / 1024 / 1024);
export const toGB = (bytes) => (bytes / 1024 / 1024 / 1024);
 
export const toMBStr = (bytes) => toMB(bytes).toFixed(2);
export const toGBStr = (bytes) => toGB(bytes).toFixed(2);
 
 
export const toMB_Unit = (bytes) => toMBStr(bytes) + ' MB';
export const toGB_Unit = (bytes) => toGBStr(bytes) + ' GB';