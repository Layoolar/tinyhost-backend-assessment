const AdmZip = require('adm-zip');

const upload = async (req, res) => {
  try {
    const email = req.body.email;
    const file = req.file;

    // Check if both email and file are present
    if (!email || !file) {
      return res.status(400).json({ error: 'Both email and file are required' });
    }
    // Extract zip file
    const zip = new AdmZip(file.buffer);
    const zipEntries = zip.getEntries();

    // Get file count and largest file
    let fileCount = 0;
    let largestFileSize = 0;
    let largestFileName = '';

    zipEntries.forEach((entry) => {
      if (!entry.isDirectory && !entry.name.startsWith('.')) {
        fileCount++;
        if (entry.header && entry.header.size > largestFileSize) {
          largestFileSize = entry.header.size;
          largestFileName = entry.name;
        }
      }
    });

    res.status(200).json({
      email: email,
      fileCount: fileCount,
      largestFileSize: `${largestFileSize} bytes`,
      largestFileName: largestFileName
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process the zip file' });
  }
};

module.exports = upload;
