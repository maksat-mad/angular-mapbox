import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { debounce } from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('mapbox', { static: true }) mapDivElement!: ElementRef;
  map: mapboxgl.Map | undefined;
  marker: mapboxgl.Marker | undefined;
  zoomInProgress = false;
  position = { lat: 43.238949, lng: 76.889709 };

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

    this.map.on('zoomstart', () => {
      this.zoomInProgress = true;
    });

    this.map.on('zoomend', () => {
      this.zoomInProgress = false;
    });

    // this.map.on('zoom', () => {
    //   this.map?.setCenter(this.position);
    // });

    this.map.on('zoom', debounce(() => {
      // this.map?.setCenter(this.position);

      this.map?.flyTo({
        center: this.position,
        essential: true, // Ensures that the animation is not interrupted by user interactions
      });
    }, 70));

    // this.map.on('zoom', () => {
    //   this.map?.panTo(
    //     this.position
    //     // essential: true, // Ensures that the animation is not interrupted by user interactions
    //   );
    // });

    // this.map.on('zoom', debounce(() => {
    //   this.map?.setCenter(this.position);
    // }, 50));

    this.map.on('move', () => {
      if (!this.zoomInProgress) {
        this.marker?.setLngLat(this.map ? this.map.getCenter() : { lat: 43.238949, lng: 76.889709 });
        this.position = this.map ? this.map.getCenter() : { lat: 43.238949, lng: 76.889709 };
      }
    });

    // this.map.on('move', (event) => {
    //   if (event.type === 'zoom') {
    //     this.map?.setCenter(this.position);
    //   } else {
    //     if (!this.zoomInProgress) {
    //       this.marker?.setLngLat(this.map ? this.map.getCenter() : { lat: 43.238949, lng: 76.889709 });
    //       this.position = this.map ? this.map.getCenter() : { lat: 43.238949, lng: 76.889709 };
    //     }
    //   }
    // });

    // this.map.on('move', (event) => {
    //   if (event.type === 'zoom') {
    //     // Handle zoom-specific logic if needed
    //   } else {
    //     if (!this.zoomInProgress) {
    //       this.marker?.setLngLat(this.map ? this.map.getCenter() : { lat: 43.238949, lng: 76.889709 });
    //       this.position = this.map ? this.map.getCenter() : { lat: 43.238949, lng: 76.889709 };
    //     }
    //   }
    // });
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
