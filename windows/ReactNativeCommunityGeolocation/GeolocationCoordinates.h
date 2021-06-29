#pragma once

#include "pch.h"
#include "NativeModules.h"

using namespace winrt;
using namespace Windows::Foundation;
using namespace Microsoft::ReactNative;

namespace winrt::ReactNativeCommunityGeolocation
{

	REACT_STRUCT(GeolocationCoordinates);
	struct GeolocationCoordinates
	{
		REACT_FIELD(Latitude, L"latitude");
		double Latitude;

		REACT_FIELD(Longitude, L"longitude");
		double Longitude;

		REACT_FIELD(Altitude, L"altitude");
		double Altitude;

		REACT_FIELD(Accuracy, L"accuracy");
		double Accuracy;

		REACT_FIELD(AltitudeAccuracy, L"altitudeAccuracy");
		double AltitudeAccuracy;

		REACT_FIELD(Heading, L"heading");
		double Heading;

		REACT_FIELD(Speed, L"speed");
		double Speed;
	};
}