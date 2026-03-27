import express, { Express, Request, Response } from 'express';
import { getConfig } from './config.js';
import { putToS3, getFromS3 } from './s3.js';

export async function createApp(): Promise<Express> {
  const app = express();

  const config = await getConfig('/DEV/playground/puzzle-lab/');
  console.log("Loaded config:", config);
  
  // Middleware
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Save a bundle to S3
  app.post('/api/bundle/:bundleId', express.raw({ type: '*/*', limit: '50mb' }), async (req: Request, res: Response) => {
    const { bundleId } = req.params;
    const bucket = config['s3_bucket'];
    if (!bucket) {
      res.status(500).json({ error: 'S3 bucket not configured' });
      return;
    }
    try {
      await putToS3(bucket, `bundles/${bundleId}.zip`, req.body as Buffer);
      res.json({ ok: true });
    } catch(err) {
      console.error(`Cannot write bundle with ID ${bundleId} to S3:`, err);
      res.status(500).json({ error: 'Failed to save bundle' });
    }
  });

  // Retrieve a bundle from S3
  app.get('/api/bundle/:bundleId', async (req: Request, res: Response) => {
    const { bundleId } = req.params;
    const bucket = config['s3_bucket'];
    if (!bucket) {
      res.status(500).json({ error: 'S3 bucket not configured' });
      return;
    }
    try {
      const data = await getFromS3(bucket, `bundles/${bundleId}.zip`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(Buffer.from(data));
    } catch (err: any) {
      if (err?.name === 'NoSuchKey') {
        res.status(404).json({ error: 'Bundle not found' });
      } else {
        console.error(`Cannot read bundle with ID ${bundleId} from S3:`, err);
        res.status(500).json({ error: 'Failed to retrieve bundle' });
      }
    }
  });



  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
