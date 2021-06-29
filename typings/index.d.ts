/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

export type GeolocationConfiguration = {
  skipPermissionRequests: boolean;
  authorizationLevel: 'always' | 'whenInUse' | 'auto';
};

export type GeolocationOptions = {
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
  distanceFilter?: number;
  useSignificantChanges?: boolean;
};

export type GeolocationResponse = {
  coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
  };
  timestamp: number;
};

export type GeolocationError = {
  code: number;
  message: string;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
};

export interface GeolocationStatic {
  /**
     * Invokes the success callback once with the latest location info.  Supported
     * options: timeout (ms), maximumAge (ms), enableHighAccuracy (bool)
     * On Android, this can return almost immediately if the location is cached or
     * request an update, which might take a while.
     */
    getCurrentPosition(
      success: (position: GeolocationResponse) => void,
      error?: (error: GeolocationError) => void,
      options?: GeolocationOptions
  ): void;

  /**
   * Invokes the success callback whenever the location changes.  Supported
   * options: timeout (ms), maximumAge (ms), enableHighAccuracy (bool), distanceFilter(m)
   */
  watchPosition(
      success: (position: GeolocationResponse) => void,
      error?: (error: GeolocationError) => void,
      options?: GeolocationOptions
  ): number;

  clearWatch(watchID: number): void;

  stopObserving(): void;

  watchStatus(
    success: (status: string) => void,
    error?: (error: GeolocationError) => void,
    options?: GeolocationOptions): number;

  clearStatusWatch(watchID: number): void;

  stopObservingStatus(): void;

  requestAuthorization(): void;

  setRNConfiguration(config: GeolocationConfiguration): void;
}

declare let Geolocation: GeolocationStatic;
export default Geolocation;
