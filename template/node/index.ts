import { ContentPropertyAPI } from '@this/common';
import { NodeRestAPI } from '@this/node'

const pageId = '';
const auth = {
    "user": "",
    "pass": ""
}

const api = new ContentPropertyAPI( new NodeRestAPI( { baseUrl: 'http://localhost:8090', auth: auth } ) );

async function test() {
  try{    
    const result = await api.getAll( pageId );
  console.log( result );  
  } catch( err ) {
    console.log( err );
  }
}
test()