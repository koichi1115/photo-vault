import express, { Request, Response } from 'express';
import multer from 'multer';
import { GlacierPhotoService } from '../services/GlacierPhotoService';

const router = express.Router();
const glacierService = new GlacierPhotoService();

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * POST /api/photos/upload
 * Upload a photo to Glacier Deep Archive
 */
router.post('/upload', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId, title, description, tags } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const parsedTags = tags ? JSON.parse(tags) : [];

    const photo = await glacierService.uploadPhoto(req.file, {
      userId,
      title,
      description,
      tags: parsedTags,
    });

    res.status(201).json({
      success: true,
      photo,
      message: 'Photo uploaded to Glacier Deep Archive successfully',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload photo' });
  }
});

/**
 * GET /api/photos/:photoId
 * Get photo metadata by ID
 */
router.get('/:photoId', async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    const photo = await glacierService.getPhoto(photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.json({ success: true, photo });
  } catch (error: any) {
    console.error('Get photo error:', error);
    res.status(500).json({ error: error.message || 'Failed to get photo' });
  }
});

/**
 * GET /api/photos/user/:userId
 * Get all photos for a user
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const photos = await glacierService.getUserPhotos(userId);

    res.json({ success: true, photos, count: photos.length });
  } catch (error: any) {
    console.error('Get user photos error:', error);
    res.status(500).json({ error: error.message || 'Failed to get user photos' });
  }
});

/**
 * POST /api/photos/:photoId/restore
 * Request photo restoration from Glacier
 */
router.post('/:photoId/restore', async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    const { tier = 'Standard' } = req.body;

    await glacierService.requestRestore(photoId, tier);

    const estimatedHours = tier === 'Bulk' ? 48 : 12;

    res.json({
      success: true,
      message: `Restore requested. Estimated completion: ${estimatedHours} hours`,
      tier,
      estimatedHours,
    });
  } catch (error: any) {
    console.error('Restore request error:', error);
    res.status(500).json({ error: error.message || 'Failed to request restoration' });
  }
});

/**
 * GET /api/photos/:photoId/restore/status
 * Check restore status
 */
router.get('/:photoId/restore/status', async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    const status = await glacierService.checkRestoreStatus(photoId);

    res.json({ success: true, photoId, status });
  } catch (error: any) {
    console.error('Check status error:', error);
    res.status(500).json({ error: error.message || 'Failed to check restore status' });
  }
});

/**
 * GET /api/photos/:photoId/download
 * Get download URL for restored photo
 */
router.get('/:photoId/download', async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    const downloadUrl = await glacierService.getDownloadUrl(photoId);

    res.json({
      success: true,
      downloadUrl,
      expiresIn: 3600, // 1 hour
    });
  } catch (error: any) {
    console.error('Download URL error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate download URL' });
  }
});

/**
 * PUT /api/photos/:photoId
 * Update photo metadata
 */
router.put('/:photoId', async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    const { title, description, tags } = req.body;

    const photo = await glacierService.updatePhotoMetadata(photoId, {
      title,
      description,
      tags,
    });

    res.json({ success: true, photo });
  } catch (error: any) {
    console.error('Update metadata error:', error);
    res.status(500).json({ error: error.message || 'Failed to update photo metadata' });
  }
});

/**
 * DELETE /api/photos/:photoId
 * Delete photo
 */
router.delete('/:photoId', async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    await glacierService.deletePhoto(photoId);

    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error: any) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete photo' });
  }
});

/**
 * GET /api/photos/user/:userId/stats
 * Get storage statistics for a user
 */
router.get('/user/:userId/stats', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const stats = await glacierService.getUserStats(userId);

    res.json({ success: true, stats });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: error.message || 'Failed to get user stats' });
  }
});

export default router;
