#pragma once

#include "pch.h"
#include "NativeModules.h"
#include "GeolocationCoordinates.h"

using namespace winrt;
using namespace Windows::Foundation;
using namespace Microsoft::ReactNative;

namespace winrt::ReactNativeCommunityGeolocation
{

	REACT_STRUCT(GeolocationPosition);
	struct GeolocationPosition
	{
		REACT_FIELD(Coords, L"coords");
		GeolocationCoordinates Coords;

		REACT_FIELD(Timestamp, L"timestamp");
		int Timestamp;
	};
}