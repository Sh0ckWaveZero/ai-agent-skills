---
name: react-hook-form-zod
description: Build or debug React Hook Form and Zod validation, including schema transforms, controlled components, dynamic arrays, multi-step forms, and async server errors.
---

# React Hook Form + Zod

## 1. Inspect the existing form contract

Read repository instructions, package manifest and lockfile, existing form components, and the submit endpoint. Identify installed React Hook Form, Zod, resolver, and UI component versions before selecting APIs. Use the repository's package manager and compatible dependencies; do not replace versions just because an example uses a different one.

Determine raw input types, parsed output, defaults, field lifecycle, server request format, and error response shape. Keep validation and payload changes within the requested scope.

## 2. Implement the smallest matching pattern

For a basic form, use the complete [form template](templates/basic-form.tsx) and its [shared schema](templates/schema.ts). Adapt the endpoint to the real application contract. The [server validation template](templates/server-validation.ts) shows the matching request and validation response; connect authentication, authorization, and persistence through the real endpoint.

- Use `register` for native inputs. For controlled widgets, map `value`, change/blur handlers, name, and ref to the component's actual API. Spread `field` only when those props match; do not register the same field twice.
- Supply suitable defaults, especially avoiding `undefined` for controlled values. For data loaded after initialization, use the project's reset/values strategy and preserve dirty edits where required.
- When schema input and output differ, use `useForm<z.input<typeof schema>, Context, z.output<typeof schema>>`. `z.infer` represents output, so it is insufficient as the sole input type for transforms.
- Validate untrusted requests at the server boundary. Share a schema when raw input contracts match; if the client sends transformed output, validate that wire format with an appropriate server schema rather than accidentally transforming twice.
- Associate labels and error descriptions with inputs. Use explicit button types, prevent duplicate submits while pending, and expose recoverable failures.

Read [advanced patterns](references/advanced-patterns.md) only for multi-step forms, arrays, controlled widgets, transformations, async validation, or performance work.

## 3. Verify the behavior

Run repository-required checks and relevant tests for the actual changed form. Verify valid/invalid submission, error placement, request shape, server rejection, and retry behavior. For multi-step forms verify forward/back navigation retains intended values; for arrays verify remove/reorder affects the intended item. Check transformed input/output types with TypeScript.

Completion: requested behavior works with the installed versions, server and client contracts agree, and actual checks and remaining limitations are reported. Templates are starting points, not evidence that the host application was tested.

## Sources

Consult official documentation for the installed versions when behavior is uncertain:

- [React Hook Form useForm](https://react-hook-form.com/docs/useform)
- [Resolver input/output typing](https://github.com/react-hook-form/resolvers#typescript)
- [Zod](https://zod.dev/)
- [shadcn React Hook Form integration](https://ui.shadcn.com/docs/forms/react-hook-form)

Adapt to the UI components already used by the project; verify migration or deprecation claims before proposing a component replacement.

Credit: original skill adapted from jezweb/claude-skills.
