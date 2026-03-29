# puzzle-lab

This is a project looking at using LLM prompting to safely vibecode puzzle ideas for public consumption

## S3 CORS checklist for presigned bundle sync

If browser uploads/downloads fail with CORS errors when using the presigned bundle endpoints, verify all of the following.

1. Bucket CORS has both PUT and GET allowed.
2. AllowedOrigins includes the exact app origin you run from (for example http://localhost:5173 during Vite dev).
3. AllowedHeaders includes Content-Type (or use * while developing).
4. ExposeHeaders includes ETag if you want to inspect upload responses client-side.
5. The bucket policy and IAM role still permit the underlying s3:PutObject and s3:GetObject operations.
6. Your app calls the API endpoint at /api/bundle/:bundleId for presign, then uploads to the returned URL directly.
7. The app does not manually add Authorization headers to the presigned S3 request.

Example CORS configuration:

```json
[
	{
		"AllowedHeaders": ["*"],
		"AllowedMethods": ["GET", "PUT", "HEAD"],
		"AllowedOrigins": [
			"http://localhost:5173",
			"https://your-production-app.example.com"
		],
		"ExposeHeaders": ["ETag"],
		"MaxAgeSeconds": 3000
	}
]
```

Quick verification steps:

1. Save CORS on the bucket and wait a minute for propagation.
2. In DevTools Network, confirm the preflight OPTIONS call succeeds for the presigned URL.
3. Confirm the PUT to the presigned URL returns 200.
4. Confirm GET /api/bundle/:bundleId returns 307 and the redirected S3 GET returns 200.