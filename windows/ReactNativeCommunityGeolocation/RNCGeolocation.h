
#pragma once

#include "pch.h"
#include <functional>
#include <sstream>
#include <string>
#include <cmath>

#include "JSValue.h"
#include "NativeModules.h"
#include "GeoOptions.h"
#include "GeoConfiguration.h"
#include "GeolocationPosition.h"
#include "GeolocationCoordinates.h"

using namespace winrt;
using namespace Windows::Devices::Geolocation;
using namespace Windows::Foundation;
using namespace Windows::UI::Core;
using namespace Microsoft::ReactNative;

namespace winrt::ReactNativeCommunityGeolocation
{
	REACT_MODULE(RNCGeolocation);
	struct RNCGeolocation
	{
		Geolocator _locator;
		GeoConfiguration _config;
		winrt::event_token _positionChangedEventToken;

		REACT_METHOD(SetConfiguration, L"setConfiguration");
		void SetConfiguration(GeoConfiguration config) noexcept
		{
			_config = config;
		}

		REACT_METHOD(RequestAuthorization, L"requestAuthorization");
		void RequestAuthorization(ReactPromise<void> promise) noexcept
		{
			auto asyncOp = RequestAuthorizationAsync(promise);
			asyncOp.Completed(MakeAsyncActionCompletedHandler(promise));
		}

		static IAsyncAction RequestAuthorizationAsync(ReactPromise<void> promise) noexcept
		{
			auto capturedPromise = promise;
			auto access = co_await Geolocator::RequestAccessAsync();
			if (access == GeolocationAccessStatus::Allowed) {
				capturedPromise.Resolve();
			}
			else if (access == GeolocationAccessStatus::Denied) {
				capturedPromise.Reject("Access was denied.");
			}
			else {
				capturedPromise.Reject("Access was unknown.");
			}
		}


		REACT_METHOD(GetCurrentPosition, L"getCurrentPosition");
		void GetCurrentPosition(GeoOptions options, ReactPromise<JSValueObject> promise) noexcept
		{
			auto asyncOp = GetCurrentPositionAsync(options, promise);
			asyncOp.Completed(MakeAsyncActionCompletedHandler(promise));
		}

		static IAsyncAction GetCurrentPositionAsync(GeoOptions options, ReactPromise<JSValueObject> promise) noexcept
		{
			auto capturedPromise = promise;
			auto locator = Geolocator();
			unsigned int accuracy = 0;
			locator.DesiredAccuracyInMeters(accuracy);

			auto position = co_await locator.GetGeopositionAsync();
			auto resultObject = ToJSValueObject(position.Coordinate());

			capturedPromise.Resolve(resultObject);
		}


		REACT_METHOD(StartObserving, L"startObserving");
		void StartObserving() noexcept
		{
			if (_locator == nullptr) {
				_locator = Geolocator();
				_locator.ReportInterval(1000);
			}

			_positionChangedEventToken = _locator.PositionChanged({ this, &RNCGeolocation::OnPositionChanged });
		}

		void OnPositionChanged(Geolocator const&, PositionChangedEventArgs const& e) noexcept {
			auto result = ToJSValueObject(e.Position().Coordinate());
			GeolocationDidChange(result);
		}

		REACT_METHOD(StopObserving, L"stopObserving");
		void StopObserving() noexcept
		{
			if (_locator != nullptr) {
				_locator.PositionChanged(_positionChangedEventToken);
			}
		}

		static JSValueObject ToJSValueObject(winrt::Windows::Devices::Geolocation::Geocoordinate coord) {
			auto resultObject = JSValueObject();

			resultObject["latitude"] = coord.Latitude();
			resultObject["longitude"] = coord.Longitude();
			//resultObject["accuracy"] = coord.Accuracy();

			//resultObject["altitude"] = ifFinite(coord.Altitude(), 0.0);
			//resultObject["altitudeAccuracy"] = ifFinite(coord.AltitudeAccuracy(), 0.0);
			//resultObject["heading"] = ifFinite(coord.Heading(), 0.0);
			//resultObject["speed"] = ifFinite(coord.Speed(), 0.0);

			return resultObject;
		}

		REACT_EVENT(GeolocationDidChange, L"geolocationDidChange");
		std::function<void(JSValueObject&)> GeolocationDidChange;

		static double ifFinite(IReference<double> reference, double defaultValue) {
			double value = reference.GetDouble();
			if (std::isfinite(value)) {
				return value;
			}
			return defaultValue;
		}

		template <class TPromiseResult>
		winrt::AsyncActionCompletedHandler MakeAsyncActionCompletedHandler(
			winrt::Microsoft::ReactNative::ReactPromise<TPromiseResult> const& promise) {
			return [promise](winrt::IAsyncAction action, winrt::AsyncStatus status) {
				if (status == winrt::AsyncStatus::Error) {
					std::stringstream errorCode;
					errorCode << "0x" << std::hex << action.ErrorCode() << std::endl;

					auto error = winrt::Microsoft::ReactNative::ReactError();
					error.Message = "HRESULT " + errorCode.str() + ": " + std::system_category().message(action.ErrorCode());
					promise.Reject(error);
				}
			};
		}

	};
}