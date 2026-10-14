#!/bin/sh
# Run once after `npx cap add ios`. Allows plain-http calls to localhost / local-network AI servers in dev.
P=ios/App/App/Info.plist
[ -f "$P" ] || { echo "Info.plist not found. Run 'npm run ios:add' first."; exit 1; }
B=/usr/libexec/PlistBuddy
$B -c "Add :NSAppTransportSecurity dict" "$P" 2>/dev/null
$B -c "Add :NSAppTransportSecurity:NSAllowsLocalNetworking bool true" "$P" 2>/dev/null || $B -c "Set :NSAppTransportSecurity:NSAllowsLocalNetworking true" "$P"
echo "Info.plist patched (NSAllowsLocalNetworking = true)."
