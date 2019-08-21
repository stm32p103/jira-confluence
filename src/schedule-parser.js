export class ScheduleParser {
	// ------------------------------------------------------------------------
	// template methods
	// ------------------------------------------------------------------------
	_load( file ) {
		return new Promise( ( resolve, reject ) => {
			let reader = new FileReader();
			reader.onload = ( event ) => {
				resolve( reader.result );
			};
			reader.readAsText( file );
		} );
	}

	_parseLine( line ) {
		return { startAt: 1, endAt: 2 };
	}

	_toName( file ) {
		let filename = file.name;
		const lastIndex = filename.lastIndexOf( '.' );
		if( lastIndex > 0 ) {
			filename = filename.substring( 0, lastIndex )
		}
		return filename;
	}
	
	_toUpdatedAt( file ) {
		return file.lastModified;
	}
	// ------------------------------------------------------------------------
	async parse( file ) {
		const name = this._toName( file );
		const updatedAt = this._toUpdatedAt( file );
		const entries = ( await this._load( file ) ).split( '\n' )
		                 .map( line => line.trim() )
		                 .filter( line => line != '' )
		                 .map( line => this._parseLine( line ) );
		return { name: name, entries: entries, updatedAt: updatedAt };
	}
}


