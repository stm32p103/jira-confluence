import React from 'react';

// material-ui
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core'
import { Checkbox } from '@material-ui/core'

export interface PropData { 
  key:string;
  propKey: string; 
  version: number; 
  date: Date;
  value: string;
};

// header
const PropHeaderRow = ( props: {} ) => 
  <TableRow>
    <TableCell>Select</TableCell>
    <TableCell>Key</TableCell>
    <TableCell>Version</TableCell>
    <TableCell>UpdatedAt</TableCell>
    <TableCell>Value(JSON)</TableCell>
  </TableRow>;

// row
const PropBodyRow = ( cp: PropData ) => <TableRow key={cp.key}>
    <TableCell><Checkbox disabled/></TableCell>
    <TableCell>{cp.propKey}</TableCell>
    <TableCell>{cp.version}</TableCell>
    <TableCell>{cp.date}</TableCell>
    <TableCell>{cp.value}</TableCell>
  </TableRow>
  
// table
export const PropTable = ( props: { cps: PropData[] } ) =><Table size="small">
  <TableHead><PropHeaderRow/></TableHead>
  <TableBody>{ props.cps.map( cp => <PropBodyRow {...cp} /> )}</TableBody>
</Table>;
