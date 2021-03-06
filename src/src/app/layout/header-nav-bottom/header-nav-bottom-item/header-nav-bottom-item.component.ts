import { Component, OnInit, Input } from '@angular/core';
import { NavMenuItem } from '../../model/nav-menu-item';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'layout-header-nav-bottom-item',
  templateUrl: './header-nav-bottom-item.component.html',
  styleUrls: ['./header-nav-bottom-item.component.scss']
})
export class HeaderNavBottomItemComponent implements OnInit {

  // tslint:disable-next-line:no-input-rename
  @Input('nav-menu-item') navMenuItem: NavMenuItem;

  constructor() { }

  ngOnInit() {
  }

}
