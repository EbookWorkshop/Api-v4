const toMB = (bytes) => (bytes / 1024 / 1024);
const toGB = (bytes) => (bytes / 1024 / 1024 / 1024);

const toMBStr = (bytes) => toMB(bytes).toFixed(2);
const toGBStr = (bytes) => toGB(bytes).toFixed(2);


const toMB_Unit = (bytes) => toMBStr(bytes) + ' MB';
const toGB_Unit = (bytes) => toGBStr(bytes) + ' GB';