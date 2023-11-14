import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {

  @Output() togglePopupEvent = new EventEmitter<void>()
  togglePopup() {
    this.togglePopupEvent.emit();
  }
  
  constructor() { }

  ngOnInit(): void {
  }

}
