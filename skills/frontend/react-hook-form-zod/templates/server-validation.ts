import { z } from 'zod';
import { schema } from './schema';

// Call inside the application's authenticated/authorized request handler.
// Supply the real persistence function; returning success requires it to finish.
export async function validateAndSave(
  request: Request,
  save: (data: z.output<typeof schema>) => Promise<void>,
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ fieldErrors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  await save(parsed.data); // Let the application error boundary handle persistence failures.
  return new Response(null, { status: 204 });
}
