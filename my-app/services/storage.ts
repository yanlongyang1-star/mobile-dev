import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

const DEFAULT_LISTING_IMAGE =
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80';

function getConfiguredStorage() {
  return storage;
}

export function isFirebaseStorageConfigured() {
  return storage != null;
}

export function getDefaultListingImageUrl() {
  return DEFAULT_LISTING_IMAGE;
}

export async function getStorageHealth() {
  if (!getConfiguredStorage()) {
    return { configured: false, detail: 'FIREBASE_STORAGE_BUCKET is not configured.' };
  }
  return { configured: true, detail: 'Firebase Storage is ready for listing photos.' };
}

async function uriToBlob(localUri: string): Promise<Blob> {
  const response = await fetch(localUri);
  if (!response.ok) {
    throw new Error('Could not read the selected photo.');
  }
  return response.blob();
}

function guessImageExtension(localUri: string) {
  const match = localUri.match(/\.(jpe?g|png|webp|heic|heif)(?:\?|$)/i);
  return match?.[1]?.toLowerCase() ?? 'jpg';
}

/** Uploads a gallery photo to `listings/{ownerUid}/{listingId}.{ext}` and returns the download URL. */
export async function uploadListingImage(
  localUri: string,
  ownerUid: string,
  listingId: string
): Promise<{ ok: true; downloadUrl: string } | { ok: false; reason: string }> {
  const bucket = getConfiguredStorage();
  if (!bucket) return { ok: false, reason: 'Firebase Storage is not configured.' };

  try {
    const blob = await uriToBlob(localUri);
    const extension = guessImageExtension(localUri);
    const path = `listings/${ownerUid}/${listingId}.${extension}`;
    const objectRef = ref(bucket, path);
    const contentType = blob.type || (extension === 'png' ? 'image/png' : 'image/jpeg');

    await uploadBytes(objectRef, blob, { contentType });
    const downloadUrl = await getDownloadURL(objectRef);
    return { ok: true, downloadUrl };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Photo upload failed.';
    return { ok: false, reason };
  }
}
