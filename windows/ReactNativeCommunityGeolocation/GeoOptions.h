#pragma once

#include "pch.h"
#include "NativeModules.h"

using namespace winrt;
using namespace Windows::Foundation;
using namespace Microsoft::ReactNative;

namespace winrt::ReactNativeCommunityGeolocation
{

	REACT_STRUCT(GeoOptions);
	struct GeoOptions
	{
		REACT_FIELD(Timeout, L"timeout");
		int Timeout;

		REACT_FIELD(MaximumAge, L"maximumAge");
		double MaximumAge;

		REACT_FIELD(EnableHighAccuracy, L"enableHighAccuracy");
		bool EnableHighAccuracy;

		REACT_FIELD(DistanceFilter, L"distanceFilter");
		double DistanceFilter;

		REACT_FIELD(UseSignificantChanges, L"useSignificantChanges");
		bool UseSignificantChanges;
	};
}