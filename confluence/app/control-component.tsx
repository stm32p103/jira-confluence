import * as React from "react";
import { Button, TextField, Paper, Grid, Switch, FormGroup, FormControlLabel } from '@material-ui/core';

interface Props {
  editable: boolean;
  toggle: () => void;
  save: () => void;
  load: () => void;
}

const classes = {
  container: {
    display: 'block',
  },
  button: {
    margin: '1em'
  }
};

export class ControlComponent extends React.Component<Props> {
  constructor( props: Props ) {
    super( props );
  }
  
  render() {
    return <FormGroup style={classes.container} >
      <Grid container>
        <Grid item xs={12}>
          <Button variant="contained" style={classes.button} onClick={()=>this.props.load()} >Load</Button>
          <Button variant="contained" style={classes.button} onClick={()=>this.props.save()} >Save</Button>
          <FormControlLabel control={<Switch checked={this.props.editable} onChange={this.props.toggle}/>} label="編集"/>
        </Grid>
      </Grid>
    </FormGroup>
  }
}
