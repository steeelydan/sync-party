# Default Request Params

When authenticated, the requesting user's ID is attached to the request by the auth middleware:
```
req.userId
```


# Default Response Properties

These properties must be present in every response and are not explicitly documented:

```ts
{
    success: Boolean;
    msg: String; // A message code resolved clientside in translations.tsx
}
```
