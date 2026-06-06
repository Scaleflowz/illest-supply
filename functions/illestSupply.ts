export default async function handler(req: Request): Promise<Response> {
  // Fetch the hosted HTML file and serve it directly
  const fileUrl = "https://base44.app/api/apps/6a21ea02495f72afbc2ec54c/files/mp/public/6a21ea02495f72afbc2ec54c/b17a3af1d_index.html";
  const res = await fetch(fileUrl);
  const html = await res.text();
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
