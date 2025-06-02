const getFileType = mimeType => {
  const [baseType] = mimeType.split('/');
  return baseType;
};

module.exports = { getFileType };
