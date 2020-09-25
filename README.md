# `@react-native-community/geolocation`

[![npm](https://img.shields.io/npm/v/@react-native-community/geolocation)](https://www.npmjs.com/package/@react-native-community/geolocation) [![CircleCI Status](https://img.shields.io/circleci/project/github/react-native-community/react-native-geolocation/master.svg)](https://circleci.com/gh/react-native-community/workflows/react-native-geolocation/tree/master) ![Supports Android, iOS and web](https://img.shields.io/badge/platforms-android%20%7C%20ios%20%7C%20web-lightgrey.svg) ![MIT License](https://img.shields.io/npm/l/@react-native-community/geolocation.svg)

The Geolocation API extends the [Geolocation web spec](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation).

Currently, on Android, this uses the [android.location API](https://developer.android.com/reference/android/location/package-summary). This API is not recommended by Google because it is less accurate and slower than the recommended [Google Location Services API](https://developer.android.com/training/location/). This is something that we want to change in the near future https://github.com/react-native-community/react-native-geolocation/issues/6.

In order to use the new [Google Location Services API](https://developer.android.com/training/location/) with React Native, please check out alternative libraries:

- [react-native-geolocation-service](https://github.com/Agontuk/react-native-geolocation-service)
- [react-native-location](https://github.com/timfpark/react-native-location)

## Getting started

`yarn add @react-native-community/geolocation`

or

`npm install @react-native-community/geolocation --save`

### Mostly automatic installation (react-native 0.59 and lower)

`react-native link @react-native-community/geolocation`

### Manual installation (react-native 0.59 and lower)

<details>
<summary>Manually link the library on iOS</summary>

### `Open project.xcodeproj in Xcode`

Drag `RNCGeolocation.xcodeproj` to your project on Xcode (usually under the Libraries group on Xcode):

![xcode-add](https://reactnative.dev/docs/assets/AddToLibraries.png)

### Link `libRNCGeolocation.a` binary with libraries

Click on your main project file (the one that represents the `.xcodeproj`) select `Build Phases` and drag the static library from the `Products` folder inside the Library you are importing to `Link Binary With Libraries` (or use the `+` sign and choose library from the list):

![xcode-link](https://reactnative.dev/docs/assets/AddToBuildPhases.png)

### Using CocoaPods

Update your `Podfile`

```
pod 'react-native-geolocation', path: '../node_modules/@react-native-community/geolocation'
```

</details>

<details>
<summary>Manually link the library on Android</summary>

#### `android/settings.gradle`
```groovy
include ':react-native-community-geolocation'
project(':react-native-community-geolocation').projectDir = new File(rootProject.projectDir, '../node_modules/@react-native-community/geolocation/android')
```

#### `android/app/build.gradle`
```groovy
dependencies {
   ...
   implementation project(':react-native-community-geolocation')
}
```

#### `android/app/src/main/.../MainApplication.java`
On top, where imports are:

```java
import com.reactnativecommunity.geolocation.GeolocationPackage;
```

Add the `GeolocationPackage` class to your list of exported packages.

```java
@Override
protected List<ReactPackage> getPackages() {
    return Arrays.asList(
            new MainReactPackage(),
            new GeolocationPackage()
    );
}
```
</details>

Since **react-native 0.60** and higher, [autolinking](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md) makes the installation process simpler

## Configuration and Permissions

<div class="banner-crna-ejected">
  <h3>Projects with Native Code Only</h3>
  <p>
    This section only applies to projects made with <code>react-native init</code>
    or to those made with <code>expo init</code> or Create React Native App which have since ejected. For
    more information about ejecting, please see
    the <a href="https://github.com/react-community/create-react-native-app/blob/master/EJECTING.md" target="_blank">guide</a> on
    the Create React Native App repository.
  </p>
</div>

### iOS

You need to include `NSLocationWhenInUseUsageDescription` and `NSLocationAlwaysAndWhenInUseUsageDescription` in `Info.plist` to enable geolocation when using the app. If your app supports iOS 10 and earlier, the `NSLocationAlwaysUsageDescription` key is also required. If these keys are not present in the `Info.plist`, authorization requests fail immediately and silently. Geolocation is enabled by default when you create a project with `react-native init`.

In order to enable geolocation in the background, you need to include the 'NSLocationAlwaysUsageDescription' key in Info.plist and add location as a background mode in the 'Capabilities' tab in Xcode.

### Android

To request access to location, you need to add the following line to your app's `AndroidManifest.xml`:

`<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />`

Android API >= 18 Positions will also contain a `mocked` boolean to indicate if position was created from a mock provider.

<p>
  Android API >= 23 Requires an additional step to check for, and request
  the ACCESS_FINE_LOCATION permission using
  the <a href="https://reactnative.dev/docs/permissionsandroid.html" target="_blank">PermissionsAndroid API</a>.
  Failure to do so may result in a hard crash.
</p>

## Migrating from the core `react-native` module
This module was created when the Geolocation was split out from the core of React Native. As a browser polyfill, this API was available through the `navigator.geolocation` global - you didn't need to import it. To migrate to this module you need to follow the installation instructions above and change following code:

```javascript
navigator.geolocation.setRNConfiguration(config);
```

to:

```javascript
import Geolocation from '@react-native-community/geolocation';

Geolocation.setRNConfiguration(config);
```

If you need to have geolocation API aligned with the browser (cross-platform apps), or want to support backward compatibility, please consider adding following lines at the root level, for example at the top of your App.js file (only for [react native](https://reactnative.dev/docs/platform-specific-code.html#native-specific-extensions-ie-sharing-code-with-nodejs-and-web)):

```javascript
navigator.geolocation = require('@react-native-community/geolocation');
```

## Usage

### Example

```javascript
import Geolocation from '@react-native-community/geolocation';

Geolocation.getCurrentPosition(info => console.log(info));
```

Check out the [example project](example) for more examples.

## Methods

### Summary

* [`setRNConfiguration`](#setrnconfiguration)
* [`requestAuthorization`](#requestauthorization)
* [`getCurrentPosition`](#getcurrentposition)
* [`watchPosition`](#watchposition)
* [`clearWatch`](#clearwatch)
* [`stopObserving`](#stopobserving)

---

### Details

#### `setRNConfiguration()`

```javascript
geolocation.setRNConfiguration(config);
```

Sets configuration options that will be used in all location requests.

**Parameters:**

| Name   | Type   | Required | Description |
| ------ | ------ | -------- | ----------- |
| config | object | Yes      | See below.  |

Supported options:

* `skipPermissionRequests` (boolean, iOS-only) - Defaults to `false`. If `true`, you must request permissions before using Geolocation APIs.
* `authorizationLevel` (string, iOS-only) - Either `"whenInUse"`, `"always"`, or `"auto"`. Changes the whether the user will be asked to give "always" or "when in use" location services permission. Any other value or `auto` will use the default behaviour, where the permission level is based on the contents of your `Info.plist`.

---

#### `requestAuthorization()`

```javascript
geolocation.requestAuthorization();
```

Request suitable Location permission based on the key configured on pList. If NSLocationAlwaysUsageDescription is set, it will request Always authorization, although if NSLocationWhenInUseUsageDescription is set, it will request InUse authorization.

---

#### `getCurrentPosition()`

```javascript
geolocation.getCurrentPosition(geo_success, [geo_error], [geo_options]);
```

Invokes the success callback once with the latest location info.

**Parameters:**

| Name        | Type     | Required | Description                               |
| ----------- | -------- | -------- | ----------------------------------------- |
| geo_success | function | Yes      | Invoked with latest location info.        |
| geo_error   | function | No       | Invoked whenever an error is encountered. |
| geo_options | object   | No       | See below.                                |

Supported options:

* `timeout` (ms) - Is a positive value representing the maximum length of time (in milliseconds) the device is allowed to take in order to return a position. Defaults to INFINITY.
* `maximumAge` (ms) - Is a positive value indicating the maximum age in milliseconds of a possible cached position that is acceptable to return. If set to 0, it means that the device cannot use a cached position and must attempt to retrieve the real current position. If set to Infinity the device will always return a cached position regardless of its age. Defaults to INFINITY.
* `enableHighAccuracy` (bool) - Is a boolean representing if to use GPS or not. If set to true, a GPS position will be requested. If set to false, a WIFI location will be requested.

---

#### `watchPosition()`

```javascript
geolocation.watchPosition(success, [error], [options]);
```

Invokes the success callback whenever the location changes. Returns a `watchId` (number).

**Parameters:**

| Name    | Type     | Required | Description                               |
| ------- | -------- | -------- | ----------------------------------------- |
| success | function | Yes      | Invoked whenever the location changes.    |
| error   | function | No       | Invoked whenever an error is encountered. |
| options | object   | No       | See below.                                |

Supported options:

* `timeout` (ms) - Is a positive value representing the maximum length of time (in milliseconds) the device is allowed to take in order to return a position. Defaults to INFINITY.
* `maximumAge` (ms) - Is a positive value indicating the maximum age in milliseconds of a possible cached position that is acceptable to return. If set to 0, it means that the device cannot use a cached position and must attempt to retrieve the real current position. If set to Infinity the device will always return a cached position regardless of its age. Defaults to INFINITY.
* `enableHighAccuracy` (bool) - Is a boolean representing if to use GPS or not. If set to true, a GPS position will be requested. If set to false, a WIFI location will be requested.
* `distanceFilter` (m) - The minimum distance from the previous location to exceed before returning a new location. Set to 0 to not filter locations. Defaults to 100m.
* `useSignificantChanges` (bool) - Uses the battery-efficient native significant changes APIs to return locations. Locations will only be returned when the device detects a significant distance has been breached. Defaults to FALSE.

---

#### `clearWatch()`

```javascript
geolocation.clearWatch(watchID);
```

**Parameters:**

| Name    | Type   | Required | Description                          |
| ------- | ------ | -------- | ------------------------------------ |
| watchID | number | Yes      | Id as returned by `watchPosition()`. |

---

#### `stopObserving()`

```javascript
geolocation.stopObserving();
```

Stops observing for device location changes. In addition, it removes all listeners previously registered.

Notice that this method has only effect if the `geolocation.watchPosition(successCallback, errorCallback)` method was previously invoked.

## Contributors

This module was extracted from `react-native` core. Please reffer to https://github.com/react-native-community/react-native-geolocation/graphs/contributors for the complete list of contributors.

## License
The library is released under the MIT licence. For more information see `LICENSE`.
