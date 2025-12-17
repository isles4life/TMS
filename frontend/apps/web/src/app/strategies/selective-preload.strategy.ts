import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Custom preloading strategy that only preloads routes marked with preload: true.
 * This reduces bandwidth usage while keeping high-traffic pages fast.
 */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Check if route data contains preload flag
    if (route.data && route.data['preload']) {
      console.log(`Preloading route: ${route.path}`);
      return load();
    }
    return of(null);
  }
}
