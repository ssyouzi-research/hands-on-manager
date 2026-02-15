"use client";

import * as React from 'react';
import querystring from 'querystring';

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { Inter } from "next/font/google";
import "./globals.css";

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import * as DataAccess from './dataaccess';

const inter = Inter({ subsets: ["latin"] });

interface Profile {
  email?: string
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [profile, setProfile] = React.useState<Profile>({});
  const [courseId, setCourseId] = React.useState('test');
  const [origin, setOrigin] = React.useState('');

  React.useEffect(() => {
    const fragmentString = window.location.hash.substring(1);
    const fragmentParams = new URLSearchParams(fragmentString);
    setCourseId(fragmentParams.get('course_id') || 'test');
    setOrigin(window.location.origin);

    DataAccess.profile().
      then((data) => {
        setProfile(data);
      });
  }, []);

  const queryParameter = querystring.stringify({
    'response_type': 'code',
    'scope': 'email openid profile',
    'redirect_uri': `${origin}/api/${courseId}/callback`,
    'client_id': process.env.NEXT_PUBLIC_CLIENT_ID,
  });
  const loginUrl = `${process.env.NEXT_PUBLIC_LOGIN_URL}?${queryParameter}`;
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!loginUrl) return;
    window.location.href = loginUrl;
  };

  return (
    <html lang="en">
      <head>
        <title>{process.env.NEXT_PUBLIC_TITLE || 'Admin UI'}</title>
      </head>
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
            <Tooltip title="Account">
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-haspopup="true"
              >
                <Avatar sx={{ width: 32, height: 32 }}></Avatar>
                <span style={{ marginLeft: '0.5rem' }}>{profile.email}</span>
              </IconButton>
            </Tooltip>
          </Box>
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
