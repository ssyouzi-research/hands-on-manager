Cognito Userpoolsを利用してAWSマネジメントコンソールを開く
===

## admin-ui/.env

```
NEXT_PUBLIC_TITLE=Hand-on Management
NEXT_PUBLIC_LOGIN_URL=<LOGIN_URL>
NEXT_PUBLIC_CLIENT_ID=<CLIENT_ID>
```

## reate-next-app

```
npx create-next-app@latest admin-ui
```

Tailwind CSSはNoに

next.config.tsを修正

```
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export"
};

export default nextConfig;
```

## 

```
pnpm add @mui/material @emotion/react @emotion/styled @mui/material-nextjs @emotion/cache @mui/icons-material
```