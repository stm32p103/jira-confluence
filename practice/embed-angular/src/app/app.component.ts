import { Component, AfterViewInit } from '@angular/core';
import { createDropdownFunction } from '../services/external-control'
import { convertElement } from '../services/element-converter'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit{
  ngAfterViewInit() {
    convertElement( {
      'p[option="greeting"]': createDropdownFunction( [ { label:'hello', value: '1' }, { label:'bye', value: '2' } ] ),
      'p[option="food"]': createDropdownFunction( [ { label:'apple', value: '1' }, { label:'orange', value: '2' } ] )
    } );
  }  
}
