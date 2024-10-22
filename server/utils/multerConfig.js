import multer, { diskStorage } from "multer";

// storage
const storage = diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads');
    },
    filename: (req, file, callback) => {
        callback(null, `file-${Date.now()}-${file.originalname}`);
    }
});

// file filtering
const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
        callback(null, true);
    } else {
        callback(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'), false);
    }
   
};

// define upload
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB limit
        files: 5 // Allow up to 5 files per request
    }
});

import fs from 'node:fs/promises';
import path from 'node:path';

export const deleteFile = async (filePath) => {
    try {
        const fullPath = path.join(process.cwd(), filePath);
        await fs.unlink(fullPath);
        console.log(`File deleted successfully: ${fullPath}`);
    } catch (error) {
        console.error(`Error deleting file: ${filePath}`, error);
    }
};

// export upload
export default upload;
