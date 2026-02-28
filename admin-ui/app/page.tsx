"use client";

import * as React from 'react';
import * as DataAccess from './dataaccess';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';

interface User {
  'email': string,
  'rolearn': string,
  'name': string
}

export default function Home() {
  const [data, setData] = React.useState<User[]>([]);
  const [courseId, setCourseId] = React.useState('test');

  React.useEffect(() => {
    const fragmentString = window.location.hash.substring(1);
    const fragmentParams = new URLSearchParams(fragmentString);
    const id = fragmentParams.get('course_id') || 'test';
    setCourseId(id);
  }, []);

  React.useEffect(() => {
    DataAccess.users(courseId).
      then((data) => {
        setData(data?.users || []);
      });
  }, []);

  const handle_click_console = (rolearn: string) => {
    DataAccess.console(rolearn).
    then((url) => {
        window.open(url, '_blank');
      }); 
  };

  return (
    <TableContainer>
      <Table sx={{ width: 640 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>ニックネーム</TableCell>
            <TableCell align="center">コンソール</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((user) => (
            <TableRow
              key={user.email}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>
                {user.name}
              </TableCell>
              <TableCell align="center"><Button variant="contained" onClick={() => { handle_click_console(user.rolearn)}}>{ user.rolearn.split(':')[4] || 'コンソール' }</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>    
  );
}
