export async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
  
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    const text = await response.text();
    throw new Error(`Expected JSON but received:\n${text.substring(0, 150)}...`);
  }
  
  return response;
}

export async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  const response = await safeFetch(url, options);
  return response.json();
}
