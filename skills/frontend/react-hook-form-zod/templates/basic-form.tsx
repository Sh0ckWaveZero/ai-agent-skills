import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { schema, errorResponseSchema } from './schema';

export function BasicForm({ endpoint }: { endpoint: string }) {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } =
    useForm<z.input<typeof schema>, undefined, z.output<typeof schema>>({
      resolver: zodResolver(schema),
      defaultValues: { email: '' },
    });

  const submit = handleSubmit(async (data) => {
    clearErrors('root');
    setSaved(false);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const parsed = errorResponseSchema.safeParse(await response.json().catch(() => null));
        const message = parsed.success ? parsed.data.fieldErrors.email?.[0] : undefined;
        if (message) setError('email', { type: 'server', message });
        else setError('root.server', { message: 'Unable to save. Please try again.' });
        return;
      }
      setSaved(true);
    } catch {
      setError('root.server', { message: 'Connection failed. Please try again.' });
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" autoComplete="email" {...register('email')}
        aria-invalid={Boolean(errors.email)}
        aria-describedby={errors.email ? 'email-error' : undefined} />
      {errors.email && <p id="email-error" role="alert">{errors.email.message}</p>}
      {errors.root?.server && <p role="alert">{errors.root.server.message}</p>}
      {saved && <p role="status">Saved.</p>}
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</button>
    </form>
  );
}
