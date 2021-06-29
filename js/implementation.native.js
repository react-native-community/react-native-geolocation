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
import { Platform } from 'react-native';

let subscriptions = [];
let updatesEnabled = false;

let statusSubscriptions = [];
let statusUpdatesEnabled = false;

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
 * See https://facebook.github.io/react-native/docs/geolocation.html
 */
const Geolocation = {
  /*
   * Sets configuration options that will be used in all location requests.
   *
   * See https://facebook.github.io/react-native/docs/geolocation.html#setrnconfiguration
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
   * See https://facebook.github.io/react-native/docs/geolocation.html#requestauthorization
   */
  requestAuthorization: async function() {
    if (Platform.OS === 'windows') {
        await RNCGeolocation.requestAuthorization();
    } else {
        RNCGeolocation.requestAuthorization();
    }
  },

  /*
   * Invokes the success callback once with the latest location info.
   *
   * See https://facebook.github.io/react-native/docs/geolocation.html#getcurrentposition
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
    if (Platform.OS === 'windows') {
        RNCGeolocation.getCurrentPosition(geo_options)
        .then((position) => {
            geo_success(position);
        }).catch((error) => {
            (geo_error || logError)(error);
        });
    } else {
        RNCGeolocation.getCurrentPosition(
          geo_options || {},
          geo_success,
          geo_error || logError,
        );
    }
  },

  /*
   * Invokes the success callback whenever the location changes.
   *
   * See https://facebook.github.io/react-native/docs/geolocation.html#watchposition
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
   * Invokes the success callback whenever the location changes.
   *
   * See https://facebook.github.io/react-native/docs/geolocation.html#watchposition
   */
  watchStatus: function(
    success: Function,
    error?: Function,
    options?: GeoOptions,
  ): number {
    if (Platform.OS === 'windows') {
        if (!statusUpdatesEnabled) {
          RNCGeolocation.startObservingStatus(options || {});
          statusUpdatesEnabled = true;
        }
        const watchID = statusSubscriptions.length;
        statusSubscriptions.push([
          GeolocationEventEmitter.addListener('statusDidChange', success),
          error
            ? GeolocationEventEmitter.addListener('geolocationError', error)
            : null,
        ]);
        return watchID;
    }
    return 0;
  },

  /*
   * Unsubscribes the watcher with the given watchID.
   *
   * See https://facebook.github.io/react-native/docs/geolocation.html#clearwatch
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
   * Unsubscribes the watcher with the given watchID.
   *
   * See https://facebook.github.io/react-native/docs/geolocation.html#clearwatch
   */
  clearStatusWatch: function(watchID: number) {
    if (Platform.OS === 'windows') {
        const sub = statusSubscriptions[watchID];
        if (!sub) {
        // Silently exit when the watchID is invalid or already cleared
        // This is consistent with timers
        return;
        }

        sub[0].remove();
        // array element refinements not yet enabled in Flow
        const sub1 = sub[1];
        sub1 && sub1.remove();
        statusSubscriptions[watchID] = undefined;
        let noWatchers = true;
        for (let ii = 0; ii < statusSubscriptions.length; ii++) {
        if (statusSubscriptions[ii]) {
            noWatchers = false; // still valid subscriptions
        }
        }
        if (noWatchers) {
        Geolocation.stopObservingStatus();
        }
    }
  },

  /*
   * Stops observing for device location changes and removes all registered listeners.
   *
   * See https://facebook.github.io/react-native/docs/geolocation.html#stopobserving
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

  /*
   * Stops observing for device location changes and removes all registered listeners.
   *
   * See https://facebook.github.io/react-native/docs/geolocation.html#stopobserving
   */
  stopObservingStatus: function() {
    if (Platform.OS === 'windows') {
        if (statusUpdatesEnabled) {
        RNCGeolocation.stopObservingStatus();
        statusUpdatesEnabled = false;
        for (let ii = 0; ii < statusSubscriptions.length; ii++) {
            const sub = statusSubscriptions[ii];
            if (sub) {
            warning(false, 'Called stopObservingStatus with existing subscriptions.');
            sub[0].remove();
            // array element refinements not yet enabled in Flow
            const sub1 = sub[1];
            sub1 && sub1.remove();
            }
        }
        statusSubscriptions = [];
        }
    }
  },

  getStatus: function(callback: Function) {
    if (Platform.OS === 'windows') {
      RNCGeolocation.getStatus(callback);
    } else {
      callback('unknown');
    }
  },
};

module.exports = Geolocation;
