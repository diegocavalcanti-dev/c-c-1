export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType?: string
): Promise<{ key: string; url: string }> {
  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!forgeApiUrl || !forgeApiKey) {
    throw new Error("Forge API credentials not configured");
  }

  const formData = new FormData();
  const blob = new Blob([data as any], { type: contentType || "application/octet-stream" });
  formData.append("file", blob, relKey);

  const response = await fetch(`${forgeApiUrl}/v1/storage/put`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${forgeApiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Storage upload failed: ${response.status} ${error}`);
  }

  const result = await response.json();
  return { key: relKey, url: result.url };
}

export async function storageGet(
  relKey: string,
  expiresIn?: number
): Promise<{ key: string; url: string }> {
  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!forgeApiUrl || !forgeApiKey) {
    throw new Error("Forge API credentials not configured");
  }

  const params = new URLSearchParams({ key: relKey });
  if (expiresIn) params.append("expiresIn", expiresIn.toString());

  const response = await fetch(
    `${forgeApiUrl}/v1/storage/get?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${forgeApiKey}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Storage get failed: ${response.status} ${error}`);
  }

  const result = await response.json();
  return { key: relKey, url: result.url };
}
