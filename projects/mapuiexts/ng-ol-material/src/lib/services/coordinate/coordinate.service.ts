import { Injectable } from '@angular/core';
import { Map, Overlay } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { transform } from 'ol/proj';
import { METERS_PER_UNIT, Units } from 'ol/proj/Units';
import { get as getProjection } from 'ol/proj/projections';

@Injectable({
  providedIn: 'root',
})
export class NolmCoordinateService {
  constructor() {}

  addCoordinatePopup(map: Map, coordinate: Coordinate): void {
    //create popup element
    const popup = document.createElement('div');
    popup.className = 'nolm-ol-popup';
    //create closer element and add to popup
    const closer = document.createElement('a');
    closer.className = 'nolm-ol-popup-closer';
    closer.href = '#';
    closer.addEventListener('click', () => {
      map.removeOverlay(overlay);
    });
    popup.appendChild(closer);
    //create content element and add to popup
    const content = document.createElement('div');
    content.className = 'nolm-ol-popup-content';
    content.innerHTML = this.getPopupText(map, coordinate);
    popup.appendChild(content);
    // create overlay to anchor popup to map
    const overlay = new Overlay({
      element: popup,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });
    map.addOverlay(overlay);
    overlay.setPosition(coordinate);
  }

  goToCoordinatePopup(
    map: Map,
    coordinate: Coordinate,
    projCode: string,
    scale: number
  ): void {
    const mapProjCode = map.getView().getProjection().getCode();
    let mapCoordinate = coordinate;
    if (projCode !== mapProjCode) {
      mapCoordinate = transform(coordinate, projCode, mapProjCode);
    }

    const centerChanged = () => {
      this.addCoordinatePopup(map, mapCoordinate);
    };
    map.once('moveend', centerChanged);
    this.zoomCenter(map, scale, mapCoordinate);
  }

  private getPopupText(map: Map, coordinate: Coordinate): string {
    const projCode = map.getView().getProjection().getCode();
    const projCodeNumber = parseInt(projCode.split(':')[1]);
    const projUnit = map.getView().getProjection().getUnits();
    const projAxisOrientation = map
      .getView()
      .getProjection()
      .getAxisOrientation();
    const googleProj = getProjection('EPSG:4326');
    const coordinateTransformed = transform(coordinate, projCode, googleProj);
    const coordStr =
      projAxisOrientation == 'neu'
        ? coordinate.slice().reverse().toString()
        : coordinate.toString();
    const text = `
      <div><code><strong>projection</strong>: <a target='_blank' href='https://epsg.io/${projCodeNumber}'>${projCode}</a></code></div>
      <div><code><strong>unit</strong>: ${projUnit}</code></div>
      <div><code><strong>axis orientation</strong>: ${projAxisOrientation}</code></div>
      <div><code><strong>${projUnit === 'degrees' ? 'LONG' : 'X'}</strong>: ${
      coordinate[0]
    }</code></div>
      <div><code><strong>${projUnit === 'degrees' ? 'LAT' : 'Y'}</strong>: ${
      coordinate[1]
    }</code></div>
      <div><code>
        <a target='_blank' href='https://www.google.com/maps/place/${coordinateTransformed
          .reverse()
          .toString()}'>
            ${coordStr}
        </a>
      </code></div>
      <div style='padding:5px;text-align:center' >
        <button onclick='navigator.clipboard.writeText("${coordStr}")' >
          Copy
        </button>
      </div>
    `;
    return text;
  }

  public stringToCoordinate(
    strCoordinate: string,
    projCode: string
  ): Coordinate | undefined {
    const proj = getProjection(projCode);
    let coordinate = undefined;
    if (strCoordinate && strCoordinate.split(',').length === 2) {
      coordinate = strCoordinate.split(',').map((item) => {
        return parseFloat(item.trim());
      });
      if (proj.getAxisOrientation() === 'neu') {
        coordinate.reverse();
      }
    }
    return coordinate;
  }

  private zoomCenter(map: Map, scale: number, coordinate: Coordinate): void {
    const resolution = this.getResolutionFromScale(map, scale);
    map.getView().setCenter(coordinate);
    map.getView().setResolution(resolution);
  }

  private getResolutionFromScale(map: Map, scale: number): number | undefined {
    const units: Units = map.getView().getProjection().getUnits() as Units;
    const dpi = 25.4 / 0.28;
    let resolution: number | undefined;

    if (units !== 'pixels' && units !== 'tile-pixels') {
      const mpu = METERS_PER_UNIT[units];
      resolution = scale / (mpu * 39.37 * dpi);
    }

    return resolution;
  }
}
