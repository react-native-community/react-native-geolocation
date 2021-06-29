
#pragma once

#include "pch.h"
#include <functional>
#include <sstream>
#include <string>
#include <cmath>
#include <chrono>

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
using namespace std::chrono;

namespace winrt::ReactNativeCommunityGeolocation
{
    REACT_MODULE(RNCGeolocation);
    struct RNCGeolocation
    {
        Geolocator _locator;
        GeoConfiguration _config;

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
            auto locator = CreateGeolocator(options);

            auto position = co_await locator.GetGeopositionAsync();
            auto resultObject = ToJSValueObject(position.Coordinate());

            capturedPromise.Resolve(resultObject);
        }


        winrt::event_token _positionChangedEventToken;

        REACT_METHOD(StartObserving, L"startObserving");
        void StartObserving(GeoOptions options) noexcept
        {
            EnsureGeolocatorInitialized(options);

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

        REACT_EVENT(GeolocationDidChange, L"geolocationDidChange");
        std::function<void(JSValueObject&)> GeolocationDidChange;


        REACT_METHOD(GetStatus, L"getStatus");
        std::string GetStatus(GeoOptions options) noexcept
        {
            EnsureGeolocatorInitialized(options);

            return StatusToString(_locator.LocationStatus());
        }

        winrt::event_token _statusChangedEventToken;

        REACT_METHOD(StartObservingStatus, L"startObservingStatus");
        void StartObservingStatus(GeoOptions options) noexcept
        {
            EnsureGeolocatorInitialized(options);

            _statusChangedEventToken = _locator.StatusChanged({ this, &RNCGeolocation::OnStatusChanged });
        }

        void OnStatusChanged(Geolocator const&, StatusChangedEventArgs const& e) noexcept {
            StatusDidChange(StatusToString(e.Status()));
        }

        REACT_METHOD(StopObservingStatus, L"stopObservingStatus");
        void StopObservingStatus() noexcept
        {
            if (_locator != nullptr) {
                _locator.StatusChanged(_statusChangedEventToken);
            }
        }

        REACT_EVENT(StatusDidChange, L"statusDidChange");
        std::function<void(std::string)> StatusDidChange;

        std::string StatusToString(PositionStatus status) {
            switch (status)
            {
            case PositionStatus::Initializing: return "initializing";
            case PositionStatus::Disabled: return "disabled";
            case PositionStatus::NoData: return "no-data";
            case PositionStatus::NotAvailable: return "not-available";
            case PositionStatus::NotInitialized: return "not-initialized";
            case PositionStatus::Ready: return "ready";
            default: return "unknown";
            }
        }

        void EnsureGeolocatorInitialized(GeoOptions options)
        {
            if (_locator == nullptr) {
                _locator = CreateGeolocator(options);
            }
        }

        static Geolocator CreateGeolocator(GeoOptions options) {
            auto locator = Geolocator();
            locator.ReportInterval(1000);
            if (options.EnableHighAccuracy) {
                locator.DesiredAccuracy(PositionAccuracy::High);
            }
            return locator;
        }

        static JSValueObject ToJSValueObject(winrt::Windows::Devices::Geolocation::Geocoordinate coord) {

            auto unixtime = winrt::clock::to_time_t(coord.Timestamp());

            auto result = JSValueObject{
                { "coords", JSValueObject {
                    { "latitude", coord.Latitude() },
                    { "longitude", coord.Longitude() },
                    { "accuracy", coord.Accuracy() },
                    { "heading", ifFinite(coord.Heading(), 0.0) },
                    { "speed", ifFinite(coord.Speed(), 0.0) }
                    }
                },
                { "timestamp", unixtime }
            };

            return result;
        }

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