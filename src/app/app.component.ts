import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as MapboxDraw from '@mapbox/mapbox-gl-draw';
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
  draw: MapboxDraw | undefined;
  accessToken = 'pk.eyJ1IjoiYWxiZXJ0b2FsZWphbmRybzEwIiwiYSI6ImNsaTIydm9iNjEyNnkzc21iY2t2djkwcGoifQ.FftaCYWGwc83vgJcHPAfDA';

  constructor() {
    // Bind the updateRoute function to the current instance of the AppComponent class
    this.updateRoute = this.updateRoute.bind(this);
    this.removeRoute = this.removeRoute.bind(this);
  }

  ngOnInit() {
    this.map = new mapboxgl.Map({
      accessToken: this.accessToken,
      container: this.mapDivElement.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: { lat: 43.238949, lng: 76.889709 },
      zoom: 12
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.marker =  new mapboxgl.Marker({
      element: this.createCustomMarkerElement('./assets/marker.svg'),
    })
      .setLngLat({ lat: 43.238949, lng: 76.889709 })
      .addTo(this.map);

    this.map.on('move', () => {
      this.marker?.setLngLat(this.map ? this.map.getCenter() : { lat: 43.238949, lng: 76.889709 });
    });

    this.draw = new MapboxDraw({
      // Instead of showing all the draw tools, show only the line string and delete tools.
      displayControlsDefault: false,
      controls: {
        line_string: true,
        trash: true
      },
      // Set the draw mode to draw LineStrings by default.
      defaultMode: 'draw_line_string',
      styles: [
        // Set the line style for the user-input coordinates.
        {
          id: 'gl-draw-line',
          type: 'line',
          filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#438EE4',
            'line-dasharray': [0.2, 2],
            'line-width': 4,
            'line-opacity': 0.7
          }
        },
        // Style the vertex point halos.
        {
          id: 'gl-draw-polygon-and-line-vertex-halo-active',
          type: 'circle',
          filter: [
            'all',
            ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static']
          ],
          paint: {
            'circle-radius': 7.24,
            'circle-color': '#DA4E41'
          }
        },
        // Style the vertex points.
        {
          id: 'gl-draw-polygon-and-line-vertex-active',
          type: 'circle',
          filter: [
            'all',
            ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static']
          ],
          paint: {
            'circle-radius': 4.345,
            'circle-color': '#FFF'
          }
        }
      ]
    });

    this.map.on('draw.create', this.updateRoute);
    this.map.on('draw.update', this.updateRoute);
    this.map.on('draw.delete', this.removeRoute);

    // Add the draw tool to the map.
    this.map.addControl(this.draw);

    document.addEventListener('dblclick', function (event) {
      event.preventDefault();
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

  // Use the coordinates you drew to make the Map Matching API request
  updateRoute() {
    // Set the profile
    const profile = 'driving';
    // Get the coordinates that were drawn on the map
    const data = this.draw!.getAll();
    const lastFeature = data.features.length - 1;
    const myGeometry: any = data.features[lastFeature].geometry;
    const coords = myGeometry.coordinates;
    // Format the coordinates
    const newCoords = coords.join(';');
    // Set the radius for each coordinate pair to 25 meters
    const radius = coords.map(() => 25);
    this.getMatch(newCoords, radius, profile);
  }

  // Make a Map Matching request
  // async getMatch(coordinates: any, radius: any, profile: any) {
  //   // Separate the radiuses with semicolons
  //   const radiuses = radius.join(';');
  //   // Create the query
  //   const query = await fetch(
  //     `https://api.mapbox.com/matching/v5/mapbox/${profile}/${coordinates}?geometries=geojson&radiuses=${radiuses}&steps=true&access_token=${this.accessToken}`,
  //     { method: 'GET' }
  //   );
  //   const response = await query.json();
  //   // Handle errors
  //   if (response.code !== 'Ok') {
  //     alert(
  //       `${response.code} - ${response.message}.\n\nFor more information: https://docs.mapbox.com/api/navigation/map-matching/#map-matching-api-errors`
  //     );
  //     return;
  //   }
  //   // Get the coordinates from the response
  //   const coords = response.matchings[0].geometry;
  //   console.log(coords);
  //   // Code from the next step will go here
  // }

  // Draw the Map Matching route as a new layer on the map
  addRoute(coords: any) {
    // If a route is already loaded, remove it
    if (this.map!.getSource('route')) {
      this.map!.removeLayer('route');
      this.map!.removeSource('route');
    } else {
      // Add a new layer to the map
      this.map!.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: coords
          }
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#DA4E41',
          'line-width': 8,
          'line-opacity': 1
        }
      });
    }
  }

  // Make a Map Matching request
  async getMatch(coordinates: any, radius: any, profile: any) {
    // Separate the radiuses with semicolons
    const radiuses = radius.join(';');
    // Create the query
    const query = await fetch(
      `https://api.mapbox.com/matching/v5/mapbox/${profile}/${coordinates}?geometries=geojson&radiuses=${radiuses}&steps=true&access_token=${this.accessToken}`,
      { method: 'GET' }
    );
    const response = await query.json();
    // Handle errors
    if (response.code !== 'Ok') {
      alert(
        `${response.code} - ${response.message}.\n\nFor more information: https://docs.mapbox.com/api/navigation/map-matching/#map-matching-api-errors`
      );
      return;
    }
    // Get the coordinates from the response
    const coords = response.matchings[0].geometry;
    // Draw the route on the map
    this.addRoute(coords);
    this.getInstructions(response.matchings[0]);
  }

  getInstructions(data: any) {
    // Target the sidebar to add the instructions
    const directions = document.getElementById('directions');
    let tripDirections = '';
    // Output the instructions for each step of each leg in the response object

    directions!.innerHTML = `<p><strong>Trip duration: ${Math.floor(
      data.duration / 60
    )} min.</strong></p><ol>${tripDirections}</ol>`;
  }

  removeRoute() {
    if (this.map?.getSource('route')) {
      this.map!.removeLayer('route');
      this.map!.removeSource('route');
    }
  }
}
