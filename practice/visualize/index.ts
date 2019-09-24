import { ContentPropertyAPI } from '@this/common';
import { AJSRestAPI } from '@this/web';
import * as d3 from 'd3';

interface Entry {
  start: Date;
  end: Date;
}

function addDays( date: Date, days: number ) {
  let result = new Date( date );
  result.setDate( result.getDate() + days );
  return result;
}

function startOfDay( date: Date ) {
  let result = new Date( date );
  result.setHours( 0, 0, 0, 0 );
  return result;
}

// 0:日
function startOfWeek( date: Date, day: number ) {
  let result = new Date( date );
  const delta = day - result.getDay();
  result.setDate( result.getDate() + delta );
  return result;
}

AJS.$(document).ready( async () => {
  const container = $('#app');
  const baseUrl = AJS.params.baseUrl;
  const cid = AJS.params.pageId;
  const api = new ContentPropertyAPI( new AJSRestAPI( baseUrl ) );

  const today = new Date();
  const start = startOfWeek( startOfDay( today ), 1 );
  const end = addDays( start, 5 );
  const xScale = d3.scaleTime().domain( [ start, end ] ).range( [ 10, 990 ] );
  const yScale = d3.scaleIdentity();

  const res = await api.get( cid, 'schedule' );
  const array: Entry[] = res.value.entries.map( entry => { return { start: entry.start, end: entry.end } } );

  console.log( array );

  const svg = d3.select("#app")
            .append("svg")
            .attr("width", '1000px')
            .attr("height", '500px');
            
  svg.append('g')
  .selectAll('rect')
  .data( array )
  .enter()
  .append( 'rect' )
  .attr( 'y', d => yScale( 0 ) )
  .attr( 'x', d => xScale( d.start ) )
  .attr( 'width', d => xScale( d.end ) - xScale( d.start ) )
  .attr( 'fill', 'blue' )
  .attr( 'height', 50 );
  
  
  const xGrid = [...Array(6).keys()].map( v => addDays( start, v ) );
  console.log( xGrid );
  
  svg.append('g')
  .attr("class", "axis")
  .call(
      d3.axisBottom( xScale )
      .tickValues( xGrid )
      .tickSize( 500 )
  );
} );
