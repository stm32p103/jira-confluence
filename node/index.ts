import { ContentPropertyAPI } from '@this/common';
import { NodeRestAPI } from '@this/node'

//5963777
const auth = {
    "user": "cadmin",
    "pass": "IY84hPuczx&#J*!Y3=w1+M@Y9Ku%7!6TyR+YE$o4TQpKlKF6GH"
}

const api = new ContentPropertyAPI( new NodeRestAPI( { baseUrl: 'http://localhost:8090', auth: auth } ) );

async function test() {
  try{    
    const result = await api.getAll( '6422536' );
  console.log( result );  
  } catch( err ) {
    console.log( err );
  }
}
test()