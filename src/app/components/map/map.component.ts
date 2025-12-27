import { Component, OnInit, OnDestroy, effect, input } from '@angular/core';
import { Map } from 'maplibre-gl';
import { City } from '../../models/city.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  template: `<div id="map" class="map-container"></div>`,
  styles: [
    `
      .map-container {
        width: 100%;
        height: 600px;
        overflow: hidden;
      }
    `,
  ],
})
export class MapComponent implements OnInit, OnDestroy {
  city = input.required<City | null>();
  style = input.required<any>();

  private map?: Map;

  constructor() {
    // React to city changes
    effect(() => {
      const currentCity = this.city();
      if (currentCity && this.map) {
        this.updateMapLocation(currentCity);
      }
    });

    // React to style changes
    effect(() => {
      const styleObj = this.style();
      if (this.map && styleObj) {
        this.map.setStyle(styleObj);
      }
    });
  }

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initializeMap(): void {
    const initialCity = this.city();
    if (!initialCity) return;

    this.map = new Map({
      container: 'map',
      style: this.style(),
      center: [initialCity.lon, initialCity.lat],
      zoom: 12,
      interactive: false, // Disable all interactions
      attributionControl: false,
    });

    this.map.on('load', () => {
      // Map is ready
    });
  }

  private updateMapLocation(city: City): void {
    if (!this.map) return;

    this.map.flyTo({
      center: [city.lon, city.lat],
      zoom: 12,
      duration: 1000,
      essential: true,
    });
  }
}
