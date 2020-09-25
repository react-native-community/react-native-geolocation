/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import {RNCGeolocation, GeolocationEventEmitter} from './nativeInterface';

import invariant from 'invariant';
import {logError, warning} from './utils';

let subscriptions = [];
let updatesEnabled = false;

type GeoConfiguration = {
  skipPermissionRequests: boolean,
  authorizationLevel: 'always' | 'whenInUse' | 'auto',
};

type GeoOptions = {
  timeout?: number,
  maximumAge?: number,
  enableHighAccuracy?: boolean,
  distanceFilter?: number,
  useSignificantChanges?: boolean,
};

/**
 * The Geolocation API extends the web spec:
 * https://developer.mozilla.org/en-US/docs/Web/API/Geolocation
 *
 * See https://reactnative.dev/docs/geolocation.html
 */
const Geolocation = {
  /*
   * Sets configuration options that will be used in all location requests.
   *
   * See https://reactnative.dev/docs/geolocation.html#setrnconfiguration
   *
   */
  setRNConfiguration: function(config: GeoConfiguration) {
    if (RNCGeolocation.setConfiguration) {
      RNCGeolocation.setConfiguration(config);
    }
  },

  /*
   * Requests Location permissions based on the key configured on pList.
   *
   * See https://reactnative.dev/docs/geolocation.html#requestauthorization
   */
  requestAuthorization: function() {
    RNCGeolocation.requestAuthorization();
  },

  /*
   * Invokes the success callback once with the latest location info.
   *
   * See https://reactnative.dev/docs/geolocation.html#getcurrentposition
   */
  getCurrentPosition: async function(
    geo_success: Function,
    geo_error?: Function,
    geo_options?: GeoOptions,
  ) {
    invariant(
      typeof geo_success === 'function',
      'Must provide a valid geo_success callback.',
    );

    // Permission checks/requests are done on the native side
    RNCGeolocation.getCurrentPosition(
      geo_options || {},
      geo_success,
      geo_error || logError,
    );
  },

  /*
   * Invokes the success callback whenever the location changes.
   *
   * See https://reactnative.dev/docs/geolocation.html#watchposition
   */
  watchPosition: function(
    success: Function,
    error?: Function,
    options?: GeoOptions,
  ): number {
    if (!updatesEnabled) {
      RNCGeolocation.startObserving(options || {});
      updatesEnabled = true;
    }
    const watchID = subscriptions.length;
    subscriptions.push([
      GeolocationEventEmitter.addListener('geolocationDidChange', success),
      error
        ? GeolocationEventEmitter.addListener('geolocationError', error)
        : null,
    ]);
    return watchID;
  },

  /*
   * Unsubscribes the watcher with the given watchID.
   *
   * See https://reactnative.dev/docs/geolocation.html#clearwatch
   */
  clearWatch: function(watchID: number) {
    const sub = subscriptions[watchID];
    if (!sub) {
      // Silently exit when the watchID is invalid or already cleared
      // This is consistent with timers
      return;
    }

    sub[0].remove();
    // array element refinements not yet enabled in Flow
    const sub1 = sub[1];
    sub1 && sub1.remove();
    subscriptions[watchID] = undefined;
    let noWatchers = true;
    for (let ii = 0; ii < subscriptions.length; ii++) {
      if (subscriptions[ii]) {
        noWatchers = false; // still valid subscriptions
      }
    }
    if (noWatchers) {
      Geolocation.stopObserving();
    }
  },

  /*
   * Stops observing for device location changes and removes all registered listeners.
   *
   * See https://reactnative.dev/docs/geolocation.html#stopobserving
   */
  stopObserving: function() {
    if (updatesEnabled) {
      RNCGeolocation.stopObserving();
      updatesEnabled = false;
      for (let ii = 0; ii < subscriptions.length; ii++) {
        const sub = subscriptions[ii];
        if (sub) {
          warning(false, 'Called stopObserving with existing subscriptions.');
          sub[0].remove();
          // array element refinements not yet enabled in Flow
          const sub1 = sub[1];
          sub1 && sub1.remove();
        }
      }
      subscriptions = [];
    }
  },
};

module.exports = Geolocation;
