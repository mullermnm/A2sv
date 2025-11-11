import multer, { StorageEngine, FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

/**
 * Ensure directory exists, create if not
 */
const ensureDirectoryExists = (directory: string): void => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

/**
 * Create multer disk storage for specified destination
 * @param destination - Can be a simple folder name (e.g., 'products') or a full path (e.g., 'uploads/products')
 */
const storage = (destination: string): StorageEngine => {
  return multer.diskStorage({
    destination: function (
      req: Request,
      file: Express.Multer.File,
      next: (error: Error | null, destination: string) => void
    ) {
      const dest = `./uploads/${destination}/${file.fieldname}`;
      try {
        ensureDirectoryExists(dest);
        console.log('req:', req);
        console.log('Directory ensured:', dest);
        next(null, dest);
      } catch (err) {
        console.error('Error creating directory:', err);
        next(err as Error, dest);
      }
    },
    filename: function (
      req: Request,
      file: Express.Multer.File,
      next: (error: Error | null, filename: string) => void
    ) {
      const fileInfo = {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname,
      };
      console.log('Processing file:', fileInfo);
      console.log('req:', req);

      const filename = `${uuidv4()}${path.extname(file.originalname)}`;
      console.log('Generated filename:', filename);
      next(null, filename);
    },
  });
};

/**
 * File filter to allow only images and PDFs
 */
const fileFilter = function (
  req: Request,
  file: Express.Multer.File,
  next: FileFilterCallback
): void {
  console.log('Filtering file:', {
    mimetype: file.mimetype,
    fieldname: file.fieldname,
    originalname: file.originalname,
  });
  console.log('req:', req);

  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('application/pdf')) {
    console.log('File accepted:', file.originalname);
    next(null, true);
  } else {
    console.log('File rejected:', file.originalname, 'mimetype:', file.mimetype);
    next(new Error('format not supported'));
  }
};

/**
 * Save uploaded file path to request body
 * Replaces the field with the file path so it can be directly stored in database
 * For paths starting with 'uploads/', transforms to API-accessible format
 */
const saveFileToBody = (req: Request, fieldname: string): void => {
  if (req.file && req.file.fieldname === fieldname) {
    let filePath = req.file.path;

    // Transform 'uploads/' paths to API-accessible format
    if (filePath.startsWith('uploads/')) {
      // Extract the part after 'uploads/' and create API path
      const relativePath = filePath.replace(/\\/g, '/').substring('uploads/'.length);
      filePath = `/api/uploads/${relativePath}`;
    }

    // Store the transformed path in the document field
    (req.body as Record<string, unknown>)[fieldname] = filePath;
    console.log('File saved to body:', {
      fieldname,
      path: (req.body as Record<string, unknown>)[fieldname],
      file: req.file,
    });
  } else {
    console.log('No file found in request for field:', fieldname);
  }
};

/**
 * Save uploaded file(s) to request body asynchronously
 */
const saveFileToBodyAsync = (
  req: Request,
  fieldname: string
): Promise<{ error: boolean; message?: string }> => {
  return Promise.resolve().then(() => {
    try {
      if (req.file) {
        Object.assign(req.body, { [fieldname]: req.file });
      } else if (req.files && Array.isArray(req.files) && req.files.length) {
        Object.assign(req.body, { [fieldname]: req.files });
      }
      console.log(req.body);
      return {
        error: false,
      };
    } catch (err) {
      return {
        error: true,
        message: (err as Error).message,
      };
    }
  });
};

/**
 * Save multiple file fields to request body
 */
const saveMultipleFieldsToBody = (
  req: Request,
  _fields: { name: string; maxCount: number }[]
): Promise<{ error: boolean; message?: string }> => {
  return Promise.resolve().then(() => {
    try {
      if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
        Object.keys(req.files).forEach((key) => {
          const files = (req.files as { [fieldname: string]: Express.Multer.File[] })[key];
          if (files) {
            (req.body as Record<string, unknown>)[key] = files.length === 1 ? files[0] : files;
          }
        });
      }
      return {
        error: false,
      };
    } catch (err) {
      return {
        error: true,
        message: (err as Error).message,
      };
    }
  });
};

/**
 * Upload file helper factory
 * Creates multer middleware for single, array, or multiple field uploads
 *
 * @param destination - Storage destination folder (e.g., 'products', 'users')
 * @returns Object with single, array, and fields upload methods
 *
 * @example
 * // In routes file:
 * import uploadFile from '@helpers/multer.helper';
 *
 * const upload = uploadFile('products');
 * router.post('/products', upload.single('productImage'), productController.create);
 *
 * // The file path will be automatically saved to req.body.productImage
 * // Controller can directly save: { ...req.body } to database
 */
export default function uploadFile(destination: string) {
  const upload = multer({
    storage: storage(destination),
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });

  return {
    /**
     * Upload single file
     * File path will be saved to req.body[fieldname]
     */
    single: (fieldname: string) => {
      return (req: Request, res: Response, next: NextFunction): void => {
        const customNext = (err: unknown): void => {
          if (err) {
            const error = err as Error;
            console.error('Multer error:', error);
            res.status(400).json({ error: true, message: error.message });
            return;
          }
          saveFileToBody(req, fieldname);
          next();
        };

        upload.single(fieldname)(req, res, customNext as NextFunction);
      };
    },

    /**
     * Upload array of files
     * File paths will be saved to req.body[fieldname]
     */
    array: (fieldname: string, maxcount: number) => {
      return (req: Request, res: Response, next: NextFunction): void => {
        const customNext = async () => {
          const { error } = await saveFileToBodyAsync(req, fieldname);
          if (!error) next();
        };

        return multer({ storage: storage(destination), fileFilter })
          .array(fieldname, maxcount)
          .bind(null, req, res, customNext)();
      };
    },

    /**
     * Upload multiple fields
     * Each field's file(s) will be saved to req.body[fieldname]
     *
     * @param fields - Array of field objects with name and maxCount
     * @example
     * upload.fields([
     *   { name: 'productImage', maxCount: 1 },
     *   { name: 'gallery', maxCount: 5 }
     * ])
     */
    fields: (fields: { name: string; maxCount: number }[]) => {
      return (req: Request, res: Response, next: NextFunction): void => {
        const customNext = (err: unknown): void => {
          if (err) {
            const error = err as Error;
            console.error('Multer error:', error);
            res.status(400).json({ error: true, message: error.message });
            return;
          }
          console.log('Files after multer processing:', req.files);
          void saveMultipleFieldsToBody(req, fields).then(({ error }) => {
            console.info(error);
            next();
          });
        };

        upload.fields(fields)(req, res, customNext as NextFunction);
      };
    },
  };
}
