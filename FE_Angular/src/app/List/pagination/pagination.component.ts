import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit, OnChanges {

  currentPage: number;
  firstIn: number;
  firstOut: number;
  totalPages: number;
  pages: number[];
  @Input() maxItemsPerPage: number;
  @Input() totalItems: number;

  constructor() { }

  ngOnInit(): void {
    this.setupPage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setupPage();
  }

  private setupPage(): void {
    this.totalPages = Math.ceil(this.totalItems / this.maxItemsPerPage);
    this.pages = Array.from({length: this.totalPages}, (_, i) => i + 1);
    this.setTo(1);
  }

  setTo(value: number): void {
    this.currentPage = value;
    this.firstIn = (this.currentPage - 1) * this.maxItemsPerPage;
    this.firstOut = Math.min(this.currentPage * this.maxItemsPerPage, this.totalItems);
    console.log('New page: ' + this.currentPage + ', items [' + this.firstIn + ', ' + (this.firstOut - 1) + ']');
  }
}
