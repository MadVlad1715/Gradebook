import {Directive, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Directive({
  selector: '[appHover]'
})
export class HoverDirective implements OnInit{

  constructor(public elementRef:ElementRef) { }
  @Input('appHover') classes:any;

  @HostListener('mouseenter') onMouseEnter() {
    this.elementRef.nativeElement.classList.add(...this.classes);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.elementRef.nativeElement.classList.remove(...this.classes);
  }

  ngOnInit() {
    if (typeof(this.classes) === 'string') this.classes = [this.classes];
  }

}
