#pragma once

#include "pch.h"
#include "NativeModules.h"
#include <string>

using namespace winrt;
using namespace Windows::Foundation;
using namespace Microsoft::ReactNative;

namespace winrt::ReactNativeCommunityGeolocation
{

	REACT_STRUCT(GeoConfiguration);
	struct GeoConfiguration
	{
		REACT_FIELD(SkipPermissionRequests, L"skipPermissionRequests");
		bool SkipPermissionRequests;

		REACT_FIELD(AuthorizationLevel, L"authorizationLevel");
		std::string AuthorizationLevel;
	};
}