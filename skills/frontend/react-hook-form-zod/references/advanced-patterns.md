# Advanced form patterns

## Schema input and output

For string input parsed to a number, keep the browser input type separate from the submit type:

```tsx
const schema = z.object({
  quantity: z.string().regex(/^\d+$/, 'Enter a whole number')
    .transform(Number).pipe(z.number().int().min(1).max(1000)),
})
const form = useForm<z.input<typeof schema>, undefined, z.output<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: { quantity: '' },
})
// register accepts the string input; handleSubmit receives numeric quantity.
```

For JSON submission of the parsed quantity, the server's wire schema must accept a number. Alternatively send raw values and apply the input schema at the server boundary. Choose one contract explicitly. Avoid parseInt shortcuts that silently accept trailing non-numeric characters.

## Multi-step and conditional fields

Keep one form instance above the step components. Use `shouldUnregister: false` (the default) when values must survive step unmounts. Set it to true only when removal of unmounted values is intentional or values are persisted and restored elsewhere.

Validate the current step's named fields before advancing and validate the complete schema on final submit. Account for cross-field refinements and show any final error in its relevant step; users must be able to navigate to and correct it. Test backward navigation and conditional fields. When a condition makes a field irrelevant, explicitly define whether its stored value is preserved or omitted from the payload.

## Controlled widgets and arrays

Map Controller callbacks to the widget API, such as `onValueChange={field.onChange}` or `checked={field.value}` for a boolean control. Attach the ref to the focusable input where supported. Follow the installed component contract instead of spreading incompatible props.

Use `field.id` as the React key in `useFieldArray`. Register paths with the current index, such as `contacts.${index}.name`. Add/remove/back/next buttons use `type="button"`; only final submission uses `type="submit"`. Avoid unregister-on-unmount for array controls whose reorder lifecycle would lose values.

## Async checks and server errors

Debounce availability checks where appropriate, but also abort or disregard stale responses when input changes. Debounce alone does not prevent race conditions. Server-side validation remains authoritative; handle rejection after a previously successful availability check.

Validate server error bodies before mapping them. Map only known field names to `setError`; use a root error for network failures, unexpected/non-JSON responses, and non-field failures. Await submission, keep pending state accurate, and allow retry. Use the framework's normal status/error conventions and do not expose internal exception details.

## Rendering

Subscribe near the consuming component with `useWatch` or `useFormState` when profiling shows broad updates. Narrow `watch` to necessary values, but do not claim that `watch('field')` isolates rerenders to a child component. Choose validation timing based on UX and measured cost rather than treating live validation as universally preferable.
