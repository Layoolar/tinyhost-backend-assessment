const AdmZip = require('adm-zip');

// Only one request can be processed at a time

const upload = async (req, res) => {
  // Only one request can be processed at a time. If we decide to use,
  //  we sacrifice some speed for race condition issues handling
  const PQueue = (await import('p-queue')).default;
  const queue = new PQueue({ concurrency: 1 });
  try {
    // await queue.add(async () => {
    const email = req.body.email;
    const file = req.file;

    // Check if both email and file are present
    if (!email || !file) {
      return res.status(400).json({ error: 'Both email and file are required' });
    }

    // Validate email address format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Ensure file is zip
    if (!/^application\/(x-zip-compressed|x-zip|zip)|multipart\/x-zip$/.test(file.mimetype)) {
      return res.status(400).json({ error: 'Only zip files are allowed' });
    }

    // Extract zip file
    const zip = new AdmZip(file.buffer);
    const zipEntries = zip.getEntries();

    // Get file count and largest file
    let fileCount = 0;
    let largestFileSize = 0;
    let largestFileName = '';

    // Loop through and count files that are not hidden
    zipEntries.forEach((entry) => {
      if (!entry.isDirectory && !entry.name.startsWith('.')) {
        fileCount++;
        if (entry.header && entry.header.size > largestFileSize) {
          largestFileSize = entry.header.size;
          largestFileName = entry.name;
        }
      }
    });

    // Send response
    res.status(200).json({
      email: email,
      fileCount: fileCount,
      largestFileSize: `${largestFileSize} bytes`,
      largestFileName: largestFileName
    });
    // });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process the zip file' });
  }
};

module.exports = upload;
