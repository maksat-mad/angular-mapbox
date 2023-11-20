import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('mapbox', { static: true }) mapDivElement!: ElementRef;
  map: mapboxgl.Map | undefined;
  marker: mapboxgl.Marker | undefined;

  ngOnInit() {
    this.map = new mapboxgl.Map({
      accessToken: 'pk.eyJ1IjoiYWxiZXJ0b2FsZWphbmRybzEwIiwiYSI6ImNsaTIydm9iNjEyNnkzc21iY2t2djkwcGoifQ.FftaCYWGwc83vgJcHPAfDA',
      container: this.mapDivElement.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: { lat: 43.238949, lng: 76.889709 },
      zoom: 12
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.marker =  new mapboxgl.Marker({
      element: this.createCustomMarkerElement('./assets/marker.png'),
    })
      .setLngLat({ lat: 43.238949, lng: 76.889709 })
      .addTo(this.map);

    this.map.on('move', () => {
      this.marker?.setLngLat(this.map ? this.map.getCenter() : { lat: 43.238949, lng: 76.889709 });
    });
  }

  createCustomMarkerElement(imagePath: string) {
    const el = document.createElement('div');
    const width = 38;
    const height = 65;
    el.style.backgroundImage = 'url(' + imagePath + ')';
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.backgroundSize = '100%';
    el.style.marginTop = '-32.5px';
    return el;
 }
}
