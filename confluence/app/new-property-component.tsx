import * as React from "react";
import { Button, TextField, Paper, Grid, FormControl } from '@material-ui/core';

interface Props {
  propKey: string;
  value: string;
  isValid: boolean;
  onKeyUpdate: ( key: string ) => void;
  onValueUpdate: ( key: string ) => void;
  onSubmit: () => void;
}

const classes = {
  container: {
    flexGrow: 1
  },
  textField: {
    width: '100%'
  },
  button: {
    margin: '1em'
  }
};

export class NewPropertyComponent extends React.Component<Props> {
  constructor( props: Props ) {
    super( props );
  }
  
  render() {
    return <div style={classes.container}>
      <Grid container>
        <Grid item xs={12}>
          <TextField
            id="key-input"
            label="Key"
            value={this.props.propKey}
            style={classes.textField}
            onChange={ (ev) => this.props.onKeyUpdate( ev.target.value ) }
            variant="filled"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="filled-dense-multiline"
            label="Value(JSON)"
            style={classes.textField}
            variant="filled"
            value={this.props.value}
            onChange={ (ev) => this.props.onValueUpdate( ev.target.value ) }
            multiline
          />
        </Grid>
        <Grid item xs={12}>
        <Button variant="contained" disabled={!this.props.isValid} style={classes.button} onClick={()=>this.props.onSubmit()} >Submit</Button>
      </Grid>
    </Grid>
    </div>
  }
}

