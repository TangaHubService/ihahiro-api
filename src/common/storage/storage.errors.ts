/**
 * Thrown only when both the primary (Cloudinary) and fallback (S3) uploads
 * have failed. Carries both underlying errors so callers/monitoring can see
 * why each provider rejected the upload.
 */
export class AllStorageProvidersFailedError extends Error {
  constructor(
    public readonly cloudinaryError: unknown,
    public readonly s3Error: unknown
  ) {
    super('File upload failed: both Cloudinary and S3 are unavailable')
    this.name = 'AllStorageProvidersFailedError'
  }
}
